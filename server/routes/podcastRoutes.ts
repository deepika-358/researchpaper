import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db, Podcast, PodcastSegment } from '../db/database.js';
import {
  evaluatePodcastScript,
  generatePodcastScript,
  SummarizationResult,
} from '../services/aiService.js';
import { storageService } from '../services/storageService.js';
import { generatePodcastAudio } from '../services/ttsService.js';

export const podcastRouter = express.Router();

// GET all podcasts
podcastRouter.get('/', (_req: Request, res: Response) => {
  try {
    const podcasts = db.getPodcasts();
    res.json({ podcasts });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve podcasts', message: err.message });
  }
});

// GET podcast by ID (with segments and evaluation)
podcastRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const podcast = db.getPodcastById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    const paper = db.getPaperById(podcast.paperId);
    const segments = db.getSegmentsByPodcastId(podcast.id);
    const evaluation = db.getEvaluationByPodcastId(podcast.id);
    const ratings = db.getRatingsByPodcastId(podcast.id);

    // Track played/viewed
    db.addHistory({
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      actionType: 'podcast_played',
      podcastId: podcast.id,
      paperId: podcast.paperId,
      timestamp: new Date().toISOString(),
      metadata: { title: podcast.title, duration: podcast.duration },
    });

    res.json({ podcast, paper, segments, evaluation, ratings });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve podcast', message: err.message });
  }
});

// POST generate podcast from an uploaded paper
podcastRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { paperId } = req.body;
    if (!paperId) {
      return res.status(400).json({ error: 'paperId is required' });
    }

    const paper = db.getPaperById(paperId);
    if (!paper) {
      return res.status(404).json({ error: 'Research paper not found' });
    }

    const podcastId = 'pod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    // Create initial queued podcast record
    const newPodcast: Podcast = {
      id: podcastId,
      paperId: paper.id,
      title: `Episode: ${paper.title}`,
      script: '',
      audioUrl: '',
      audioFormat: 'audio/wav',
      duration: 0,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };

    db.createPodcast(newPodcast);

    // Respond immediately with queued status (Non-blocking async workflow)
    res.status(202).json({
      message: 'Podcast generation started',
      podcast: newPodcast,
    });

    // Run async generation pipeline
    (async () => {
      try {
        db.updatePodcast(podcastId, { status: 'extracting' });

        const sections = db.getSectionsByPaperId(paper.id);
        const summarizationData: SummarizationResult = {
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract,
          keywords: paper.keywords,
          sections: sections.map((s) => ({
            sectionName: s.sectionName,
            summary: s.summary,
            originalText: s.originalText,
            orderIndex: s.orderIndex,
          })),
        };

        db.updatePodcast(podcastId, { status: 'summarizing' });
        await new Promise((r) => setTimeout(r, 600));

        db.updatePodcast(podcastId, { status: 'script_generating' });
        const scriptResult = await generatePodcastScript(paper.title, summarizationData);

        db.updatePodcast(podcastId, {
          title: scriptResult.title,
          script: scriptResult.script,
          status: 'host_audio_generating',
        });

        // Save podcast segments
        const segmentsToSave: PodcastSegment[] = scriptResult.segments.map((seg, idx) => ({
          id: `seg-${podcastId}-${idx}`,
          podcastId,
          speaker: seg.speaker,
          text: seg.text,
          sequence: seg.sequence,
          duration: seg.durationEstimate,
        }));
        db.setPodcastSegments(podcastId, segmentsToSave);

        // Generate clean studio audio
        const audioResult = await generatePodcastAudio(
          podcastId,
          segmentsToSave,
          (stage) => {
            db.updatePodcast(podcastId, { status: stage as any });
          }
        );

        db.updatePodcast(podcastId, { status: 'audio_processing' });

        // Run AI Factual Evaluation
        const combinedOriginalText = sections.map((s) => `${s.sectionName}: ${s.originalText}`).join('\n\n');
        const evaluationResult = await evaluatePodcastScript(combinedOriginalText, scriptResult.script);

        db.setEvaluation({
          id: `eval-${podcastId}`,
          podcastId,
          factualAccuracyScore: evaluationResult.factualAccuracyScore,
          clarityScore: evaluationResult.clarityScore,
          unsupportedClaims: evaluationResult.unsupportedClaims,
          detectedIssues: evaluationResult.detectedIssues,
          evaluationSummary: evaluationResult.evaluationSummary,
          createdAt: new Date().toISOString(),
        });

        // Mark podcast as completed
        db.updatePodcast(podcastId, {
          status: 'completed',
          audioUrl: audioResult.audioUrl,
          audioFormat: audioResult.audioFormat,
          duration: audioResult.duration,
          completedAt: new Date().toISOString(),
        });

        console.log(`Podcast ${podcastId} successfully generated and completed!`);
      } catch (genErr: any) {
        console.error(`Podcast generation failed for ${podcastId}:`, genErr);
        db.updatePodcast(podcastId, {
          status: 'failed',
          errorMessage: genErr.message || 'Podcast generation failed. Please try again.',
        });
      }
    })();
  } catch (err: any) {
    console.error('Error initiating podcast generation:', err);
    res.status(500).json({ error: 'Podcast generation failed. Please try again.', message: err.message });
  }
});

// GET download podcast audio file
podcastRouter.get('/:id/download', (req: Request, res: Response) => {
  try {
    const podcast = db.getPodcastById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ error: 'Unable to download the podcast.' });
    }

    const paper = db.getPaperById(podcast.paperId);
    const paperTitle = paper ? paper.title : podcast.title;
    const sanitizedTitle = paperTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);

    const filename = path.basename(podcast.audioUrl || `podcast_${podcast.id}.wav`);
    const filePath = storageService.getAudioFilePath(filename);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Audio file not found on server.' });
    }

    // Track download in history
    db.addHistory({
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      actionType: 'podcast_downloaded',
      podcastId: podcast.id,
      paperId: podcast.paperId,
      timestamp: new Date().toISOString(),
      metadata: { title: podcast.title, filename: `PaperCast_AI_${sanitizedTitle}.wav` },
    });

    const downloadName = `PaperCast_AI_${sanitizedTitle}.wav`;
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Type', 'audio/wav');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err: any) {
    console.error('Error downloading podcast:', err);
    res.status(500).json({ error: 'Unable to download the podcast.', message: err.message });
  }
});

// DELETE podcast
podcastRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const podcast = db.getPodcastById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    if (podcast.audioUrl) {
      storageService.deleteAudioFile(podcast.audioUrl);
    }

    const deleted = db.deletePodcast(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Unable to delete the selected item.' });
    }

    res.json({ message: 'Podcast deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Unable to delete the selected item.', message: err.message });
  }
});
