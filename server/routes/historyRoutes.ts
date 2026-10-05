import express, { Request, Response } from 'express';
import { db } from '../db/database.js';

export const historyRouter = express.Router();

historyRouter.get('/', (_req: Request, res: Response) => {
  try {
    const history = db.getHistory();
    const searchHistory = db.getSearchHistory();
    res.json({ history, searchHistory });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve history', message: err.message });
  }
});

historyRouter.delete('/', (_req: Request, res: Response) => {
  try {
    db.clearHistory();
    res.json({ message: 'History cleared successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear history', message: err.message });
  }
});
