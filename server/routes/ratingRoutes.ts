import express, { Request, Response } from 'express';
import { db, Rating } from '../db/database.js';

export const ratingRouter = express.Router();

// GET ratings by podcast ID
ratingRouter.get('/:podcastId', (req: Request, res: Response) => {
  try {
    const ratings = db.getRatingsByPodcastId(req.params.podcastId);
    res.json({ ratings });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve ratings', message: err.message });
  }
});

// POST submit feedback/rating
ratingRouter.post('/', (req: Request, res: Response) => {
  try {
    const { podcastId, clarityScore, accuracyScore, usefulnessScore, feedback } = req.body;

    if (!podcastId) {
      return res.status(400).json({ error: 'podcastId is required' });
    }

    const c = Math.max(1, Math.min(5, Number(clarityScore) || 5));
    const a = Math.max(1, Math.min(5, Number(accuracyScore) || 5));
    const u = Math.max(1, Math.min(5, Number(usefulnessScore) || 5));
    const overall = parseFloat(((c + a + u) / 3).toFixed(1));

    const newRating: Rating = {
      id: 'rate-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      podcastId,
      clarityScore: c,
      accuracyScore: a,
      usefulnessScore: u,
      overallScore: overall,
      feedback: typeof feedback === 'string' ? feedback.trim() : '',
      createdAt: new Date().toISOString(),
    };

    db.addRating(newRating);

    res.status(201).json({
      message: 'Rating and feedback submitted successfully.',
      rating: newRating,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit rating', message: err.message });
  }
});
