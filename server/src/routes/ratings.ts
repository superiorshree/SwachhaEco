import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbAdapter } from '../db/dbAdapter';

const router = Router();

// Submit rating (User -> Collector or Collector -> User)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { request_id, rater_id, rater_role, target_id, rating, comment } = req.body;

    if (!request_id || !rater_id || !rater_role || !target_id || !rating) {
      return res.status(400).json({ error: 'request_id, rater_id, rater_role, target_id, and rating (1-5) are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    if (!['user', 'collector'].includes(rater_role)) {
      return res.status(400).json({ error: 'rater_role must be user or collector.' });
    }

    // Check request existence
    const request = await dbAdapter.getRequestById(request_id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    const ratingId = `rat_${Date.now()}_${uuidv4().slice(0, 6)}`;
    const now = new Date().toISOString();

    await dbAdapter.saveRating({
      id: ratingId,
      request_id,
      rater_id,
      rater_role,
      target_id,
      rating: Number(rating),
      comment: comment || null,
      created_at: now
    });

    const ratingsForRequest = await dbAdapter.getRatingsForRequest(request_id);

    res.status(201).json({
      message: 'Rating recorded successfully',
      ratings: ratingsForRequest
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get ratings for a request
router.get('/request/:requestId', async (req: Request, res: Response) => {
  try {
    const ratings = await dbAdapter.getRatingsForRequest(req.params.requestId);
    res.json(ratings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
