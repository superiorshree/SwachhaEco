import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { dbAdapter } from '../db/dbAdapter';
import { analyzePhotoExif } from '../services/exifService';
import { evaluateUserReputation } from '../services/trustService';
import { isSupabaseConfigured, supabase } from '../db/supabaseClient';

const router = Router();

// Configure multer with in-memory storage for serverless compatibility
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are permitted.'));
    }
    cb(null, true);
  }
});

const VALID_CATEGORIES = ['Organic', 'Plastic', 'Paper', 'E-Waste', 'Medical', 'Other'];

// 0. Get all requests (overview)
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const requests = await dbAdapter.getRequestsOverview();
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const requests = await dbAdapter.getRequestsOverview();
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Get user requests
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requests = await dbAdapter.getUserRequests(userId);
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get single request
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const request = await dbAdapter.getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create new pickup request (with rate limiting, EXIF & GPS detection)
router.post('/', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const { user_id, waste_category, pickup_location, pickup_date } = req.body;

    if (!user_id || !waste_category || !pickup_location || !pickup_date) {
      return res.status(400).json({ error: 'All fields (user_id, waste_category, pickup_location, pickup_date) are required.' });
    }

    if (!VALID_CATEGORIES.includes(waste_category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    // Rate Limit Check: Max 5 open (non-Completed, non-Rejected) requests
    const openCount = await dbAdapter.getOpenRequestCount(user_id);
    if (openCount >= 5) {
      return res.status(429).json({
        error: 'Rate limit exceeded: You have 5 open pickup requests in flight. Please await fulfillment or cancellation before submitting new requests.',
        open_request_count: openCount
      });
    }

    // Photo processing & EXIF extraction
    let photoUrl = '';
    let photoExifPresent = false;
    let photoGpsMatch: boolean | null = null;
    let exifSummary = 'No photo provided';

    if (req.file) {
      const fileBuffer = req.file.buffer;
      const exifResult = await analyzePhotoExif(fileBuffer, pickup_location);
      photoExifPresent = exifResult.hasExif;
      photoGpsMatch = exifResult.gpsMatch;
      exifSummary = exifResult.summary;

      // Handle cloud storage or Base64 data URL
      let uploadedToStorage = false;
      if (isSupabaseConfigured && supabase) {
        try {
          const fileExt = req.file.originalname.split('.').pop() || 'jpg';
          const fileName = `waste_${Date.now()}_${uuidv4().slice(0, 8)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('waste-photos')
            .upload(fileName, fileBuffer, {
              contentType: req.file.mimetype,
              upsert: true
            });

          if (!uploadError) {
            const { data: publicData } = supabase.storage
              .from('waste-photos')
              .getPublicUrl(fileName);
            if (publicData?.publicUrl) {
              photoUrl = publicData.publicUrl;
              uploadedToStorage = true;
            }
          }
        } catch {
          // If storage bucket isn't configured, fall through to Base64 data URL
          uploadedToStorage = false;
        }
      }

      if (!uploadedToStorage) {
        // Base64 Data URL (guarantees persistence across serverless and database)
        photoUrl = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      }
    } else if (req.body.photo_url) {
      photoUrl = req.body.photo_url;
      photoExifPresent = false;
      photoGpsMatch = null;
      exifSummary = 'External URL image';
    } else {
      return res.status(400).json({ error: 'A photo of the waste is required for fraud mitigation.' });
    }

    const requestId = `req_${Date.now()}_${uuidv4().slice(0, 6)}`;
    const now = new Date().toISOString();

    await dbAdapter.createRequest({
      id: requestId,
      user_id,
      waste_category,
      pickup_location,
      pickup_date,
      photo_url: photoUrl,
      photo_exif_present: photoExifPresent,
      photo_gps_match: photoGpsMatch,
      status: 'Submitted',
      created_at: now,
      updated_at: now
    });

    const createdRequest = await dbAdapter.getRequestById(requestId);

    res.status(201).json({
      message: 'Pickup request submitted successfully',
      request: createdRequest,
      fraud_signals: {
        photo_exif_present: photoExifPresent,
        photo_gps_match: photoGpsMatch,
        summary: exifSummary,
        open_requests_remaining: 4 - openCount
      }
    });
  } catch (err: any) {
    console.error('Error creating request:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Update request status (Collector or Admin)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, rejection_reason, collector_id } = req.body;
    const { id } = req.params;

    const allowedStatuses = ['Submitted', 'Assigned', 'On the Way', 'Completed', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    if (status === 'Rejected' && !rejection_reason) {
      return res.status(400).json({ error: 'A rejection reason is required when rejecting a request.' });
    }

    const existing = await dbAdapter.getRequestById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const now = new Date().toISOString();
    const finalCollectorId = collector_id !== undefined ? collector_id : existing.collector_id;
    const finalReason = status === 'Rejected' ? rejection_reason : null;

    await dbAdapter.updateRequest(id, {
      status,
      rejection_reason: finalReason,
      collector_id: finalCollectorId,
      updated_at: now
    });

    // Evaluate trust reputation if completed or rejected
    let trustResult = null;
    if (status === 'Completed' || status === 'Rejected') {
      trustResult = await evaluateUserReputation(existing.user_id);
    }

    const updated = await dbAdapter.getRequestById(id);

    res.json({
      message: `Request status transitioned to ${status}`,
      request: updated,
      trust_update: trustResult
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Collector claim endpoint (Self-assign)
router.post('/:id/claim', async (req: Request, res: Response) => {
  try {
    const { collector_id } = req.body;
    const { id } = req.params;

    if (!collector_id) {
      return res.status(400).json({ error: 'collector_id is required to claim a request.' });
    }

    const existing = await dbAdapter.getRequestById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (existing.status !== 'Submitted' || existing.collector_id) {
      return res.status(400).json({ error: 'Request is already claimed or not in Submitted status.' });
    }

    const now = new Date().toISOString();
    await dbAdapter.updateRequest(id, {
      status: 'Assigned',
      collector_id,
      updated_at: now
    });

    const updated = await dbAdapter.getRequestById(id);
    res.json({ message: 'Request claimed successfully', request: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Admin reassign endpoint
router.patch('/:id/reassign', async (req: Request, res: Response) => {
  try {
    const { collector_id } = req.body;
    const { id } = req.params;

    const existing = await dbAdapter.getRequestById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const now = new Date().toISOString();
    const newStatus = collector_id ? (existing.status === 'Submitted' ? 'Assigned' : existing.status) : 'Submitted';

    await dbAdapter.updateRequest(id, {
      collector_id: collector_id || null,
      status: newStatus,
      updated_at: now
    });

    const updated = await dbAdapter.getRequestById(id);
    res.json({ message: 'Collector reassigned successfully', request: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
