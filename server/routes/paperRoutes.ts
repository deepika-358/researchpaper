import express, { Request, Response } from 'express';
import multer from 'multer';
import { db, ResearchPaper } from '../db/database.js';
import { extractTextFromPdf } from '../services/pdfService.js';
import { storageService } from '../services/storageService.js';
import { summarizeResearchPaper } from '../services/aiService.js';

const upload = multer({
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Please upload a valid PDF file.'));
    }
  },
});

export const paperRouter = express.Router();

// GET all papers
paperRouter.get('/', (_req: Request, res: Response) => {
  try {
    const papers = db.getPapers();
    res.json({ papers });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve papers', message: err.message });
  }
});

// GET paper by ID with its sections and associated podcasts
paperRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const paper = db.getPaperById(req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Research paper not found' });
    }
    const sections = db.getSectionsByPaperId(paper.id);
    const podcasts = db.getPodcastsByPaperId(paper.id);

    // Track view in history
    db.addHistory({
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      actionType: 'paper_viewed',
      paperId: paper.id,
      timestamp: new Date().toISOString(),
      metadata: { title: paper.title },
    });

    res.json({ paper, sections, podcasts });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve paper', message: err.message });
  }
});

// POST upload PDF paper
paperRouter.post('/upload', upload.single('pdf'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid PDF file.' });
    }

    const file = req.file;
    const paperId = 'paper-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    // Save PDF to storage
    const fileUrl = storageService.savePaperFile(file.originalname, file.buffer);

    // Extract text and sections
    let extracted;
    try {
      extracted = await extractTextFromPdf(file.buffer, file.originalname);
    } catch (parseErr: any) {
      storageService.deletePaperFile(fileUrl);
      return res.status(422).json({
        error: parseErr.message || "We couldn't extract readable text from this PDF.",
      });
    }

    // AI Summarization
    const summary = await summarizeResearchPaper(extracted.rawText, {
      title: extracted.title,
      authors: extracted.authors,
      sections: extracted.sections,
    });

    const newPaper: ResearchPaper = {
      id: paperId,
      title: summary.title,
      authors: summary.authors,
      abstract: summary.abstract,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      publicationDate: extracted.publicationDate,
      keywords: summary.keywords,
      processingStatus: 'completed',
    };

    db.createPaper(newPaper);

    // Save sections
    const paperSections = summary.sections.map((s, idx) => ({
      id: `sec-${paperId}-${idx}`,
      paperId,
      sectionName: s.sectionName,
      originalText: s.originalText,
      summary: s.summary,
      orderIndex: idx,
    }));
    db.setPaperSections(paperId, paperSections);

    res.status(201).json({
      message: 'Research paper uploaded and analyzed successfully.',
      paper: newPaper,
      sections: paperSections,
    });
  } catch (err: any) {
    console.error('Error uploading paper:', err);
    if (err.message && err.message.includes('limit')) {
      return res.status(413).json({ error: 'This file exceeds the supported size.' });
    }
    res.status(500).json({ error: 'Unable to process research paper', message: err.message });
  }
});

// DELETE paper by ID
paperRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const paper = db.getPaperById(req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Research paper not found' });
    }

    // Delete stored files
    if (paper.fileUrl) {
      storageService.deletePaperFile(paper.fileUrl);
    }

    const podcasts = db.getPodcastsByPaperId(paper.id);
    for (const pod of podcasts) {
      if (pod.audioUrl) {
        storageService.deleteAudioFile(pod.audioUrl);
      }
    }

    const deleted = db.deletePaper(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Unable to delete the selected item.' });
    }

    res.json({ message: 'Research paper and associated data deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Unable to delete the selected item.', message: err.message });
  }
});
