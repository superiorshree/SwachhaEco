import { Router, Request, Response } from 'express';
import { dbAdapter } from '../db/dbAdapter';

const router = Router();

router.get('/overview', async (req: Request, res: Response) => {
  try {
    const stats = await dbAdapter.getStatsOverview();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
