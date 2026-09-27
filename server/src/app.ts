import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { dbAdapter } from './db/dbAdapter';
import requestsRouter from './routes/requests';
import ratingsRouter from './routes/ratings';
import statsRouter from './routes/stats';

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve local uploads directory if it exists
const uploadsDir = path.join(__dirname, '../uploads');
if (fs.existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir));
}

// Health / Status endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SwachhaEco • Solid Waste Management Platform API',
    deployment: 'Vercel Serverless & Cloud Ready',
    timestamp: new Date().toISOString()
  });
});

// Modular API routers
app.use('/api/requests', requestsRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/stats', statsRouter);

// Users endpoints
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await dbAdapter.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await dbAdapter.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Badges endpoint
app.get('/api/badges', async (req: Request, res: Response) => {
  try {
    const badges = await dbAdapter.getBadges();
    res.json(badges);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend build if present (standalone / local production mode)
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

export default app;
