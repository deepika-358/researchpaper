import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { paperRouter } from './server/routes/paperRoutes.js';
import { podcastRouter } from './server/routes/podcastRoutes.js';
import { evaluationRouter } from './server/routes/evaluationRoutes.js';
import { ratingRouter } from './server/routes/ratingRoutes.js';
import { searchRouter } from './server/routes/searchRoutes.js';
import { historyRouter } from './server/routes/historyRoutes.js';
import { dashboardRouter } from './server/routes/dashboardRoutes.js';
import { storageService } from './server/services/storageService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Storage stream route for generated audio files with HTTP Range support for seeking
app.get('/api/storage/audio/:filename', (req, res) => {
  const filePath = storageService.getAudioFilePath(req.params.filename);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).send('Audio file not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/wav',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/wav',
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Storage stream route for PDF research papers
app.get('/api/storage/papers/:filename', (req, res) => {
  const filePath = storageService.getPaperFilePath(req.params.filename);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).send('Paper PDF not found');
  }
  res.setHeader('Content-Type', 'application/pdf');
  fs.createReadStream(filePath).pipe(res);
});

// Mount REST API endpoints
app.use('/api/papers', paperRouter);
app.use('/api/podcasts', podcastRouter);
app.use('/api/evaluations', evaluationRouter);
app.use('/api/ratings', ratingRouter);
app.use('/api/search', searchRouter);
app.use('/api/history', historyRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'PaperCast AI',
    timestamp: new Date().toISOString(),
  });
});

// Development vs Production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PaperCast AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start PaperCast AI server:', err);
  process.exit(1);
});
