import express, { Request, Response } from 'express';
import { db } from '../db/database.js';

export const dashboardRouter = express.Router();

dashboardRouter.get('/', (_req: Request, res: Response) => {
  try {
    const papers = db.getPapers();
    const podcasts = db.getPodcasts();
    const ratings = db.getAllRatings();
    const history = db.getHistory();

    const completedPodcasts = podcasts.filter((p) => p.status === 'completed');
    const totalListeningSeconds = completedPodcasts.reduce((acc, curr) => acc + (curr.duration || 0), 0);

    const averageRating =
      ratings.length > 0
        ? parseFloat((ratings.reduce((acc, r) => acc + r.overallScore, 0) / ratings.length).toFixed(1))
        : 0;

    const activeProcessing = podcasts.filter((p) => p.status !== 'completed' && p.status !== 'failed');

    res.json({
      stats: {
        totalPapers: papers.length,
        totalPodcasts: podcasts.length,
        totalListeningTimeSeconds: totalListeningSeconds,
        averageRating,
        totalRatingsCount: ratings.length,
      },
      recentPapers: papers.slice(0, 5),
      recentPodcasts: podcasts.slice(0, 5),
      recentActivity: history.slice(0, 8),
      activeProcessing,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve dashboard stats', message: err.message });
  }
});
