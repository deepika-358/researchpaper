import express, { Request, Response } from 'express';
import { db } from '../db/database.js';

export const searchRouter = express.Router();

searchRouter.get('/', (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').toLowerCase().trim();
    const filter = (req.query.filter as string || 'all').toLowerCase().trim();

    if (q) {
      db.addSearchQuery(q);
    }

    const allPapers = db.getPapers();
    const allPodcasts = db.getPodcasts();

    let matchedPapers = allPapers;
    let matchedPodcasts = allPodcasts;

    if (q) {
      matchedPapers = allPapers.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const authorsMatch = p.authors.some((a) => a.toLowerCase().includes(q));
        const keywordsMatch = p.keywords.some((k) => k.toLowerCase().includes(q));
        const abstractMatch = p.abstract.toLowerCase().includes(q);
        const dateMatch = (p.publicationDate || p.uploadedAt).toLowerCase().includes(q);
        return titleMatch || authorsMatch || keywordsMatch || abstractMatch || dateMatch;
      });

      matchedPodcasts = allPodcasts.filter((pod) => {
        const titleMatch = pod.title.toLowerCase().includes(q);
        const scriptMatch = pod.script.toLowerCase().includes(q);
        const paper = allPapers.find((p) => p.id === pod.paperId);
        const paperMatch = paper
          ? paper.title.toLowerCase().includes(q) ||
            paper.authors.some((a) => a.toLowerCase().includes(q))
          : false;
        return titleMatch || scriptMatch || paperMatch;
      });
    }

    // Apply categorical filters
    if (filter === 'papers') {
      matchedPodcasts = [];
    } else if (filter === 'podcasts') {
      matchedPapers = [];
    } else if (filter === 'completed') {
      matchedPodcasts = matchedPodcasts.filter((p) => p.status === 'completed');
      matchedPapers = matchedPapers.filter((p) => p.processingStatus === 'completed');
    } else if (filter === 'processing') {
      matchedPodcasts = matchedPodcasts.filter((p) => p.status !== 'completed' && p.status !== 'failed');
      matchedPapers = matchedPapers.filter((p) => p.processingStatus !== 'completed' && p.processingStatus !== 'failed');
    } else if (filter === 'recent') {
      // Sort most recent first
      matchedPapers = [...matchedPapers].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      matchedPodcasts = [...matchedPodcasts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    res.json({
      query: q,
      filter,
      totalCount: matchedPapers.length + matchedPodcasts.length,
      papers: matchedPapers,
      podcasts: matchedPodcasts,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Search failed', message: err.message });
  }
});
