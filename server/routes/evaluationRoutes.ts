import express, { Request, Response } from 'express';
import { db } from '../db/database.js';

export const evaluationRouter = express.Router();

evaluationRouter.get('/:podcastId', (req: Request, res: Response) => {
  try {
    const evaluation = db.getEvaluationByPodcastId(req.params.podcastId);
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found for this podcast' });
    }
    res.json({ evaluation });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve evaluation', message: err.message });
  }
});
