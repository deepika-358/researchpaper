import fs from 'fs';
import path from 'path';
import {
  concatenatePcmSegments,
  synthesizeCleanSpeechPcm,
} from './audioProcessor.js';

const STORAGE_ROOT = path.resolve(process.cwd(), 'storage');
const PAPERS_DIR = path.join(STORAGE_ROOT, 'papers');
const AUDIO_DIR = path.join(STORAGE_ROOT, 'audio');

export class StorageService {
  constructor() {
    this.ensureDirs();
    this.ensureSeedAudio();
  }

  private ensureDirs() {
    if (!fs.existsSync(STORAGE_ROOT)) fs.mkdirSync(STORAGE_ROOT, { recursive: true });
    if (!fs.existsSync(PAPERS_DIR)) fs.mkdirSync(PAPERS_DIR, { recursive: true });
    if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  public getPapersDir(): string {
    return PAPERS_DIR;
  }

  public getAudioDir(): string {
    return AUDIO_DIR;
  }

  public savePaperFile(filename: string, buffer: Buffer): string {
    this.ensureDirs();
    const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(PAPERS_DIR, safeName);
    fs.writeFileSync(filePath, buffer);
    return `/api/storage/papers/${safeName}`;
  }

  public saveAudioFile(filename: string, buffer: Buffer): string {
    this.ensureDirs();
    const safeName = filename.endsWith('.wav') ? filename : `${filename}.wav`;
    const filePath = path.join(AUDIO_DIR, safeName);
    fs.writeFileSync(filePath, buffer);
    return `/api/storage/audio/${safeName}`;
  }

  public deletePaperFile(fileUrl: string): boolean {
    try {
      const filename = path.basename(fileUrl);
      const filePath = path.join(PAPERS_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    } catch (e) {
      console.error('Error deleting paper file:', e);
    }
    return false;
  }

  public deleteAudioFile(audioUrl: string): boolean {
    try {
      const filename = path.basename(audioUrl);
      const filePath = path.join(AUDIO_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    } catch (e) {
      console.error('Error deleting audio file:', e);
    }
    return false;
  }

  public getAudioFilePath(filename: string): string | null {
    const filePath = path.join(AUDIO_DIR, filename);
    if (fs.existsSync(filePath)) return filePath;
    return null;
  }

  public getPaperFilePath(filename: string): string | null {
    const filePath = path.join(PAPERS_DIR, filename);
    if (fs.existsSync(filePath)) return filePath;
    return null;
  }

  /**
   * Generates the seed audio file if it doesn't exist yet,
   * guaranteeing that the first seeded podcast plays clean audio immediately.
   */
  private ensureSeedAudio() {
    try {
      const seedFile = path.join(AUDIO_DIR, 'seed-transformer.wav');
      if (!fs.existsSync(seedFile)) {
        console.log('Generating seed clean studio podcast audio...');
        const scriptLines = [
          { speaker: 'HOST' as const, text: 'Welcome to PaperCast AI. Today we are exploring Attention Is All You Need.' },
          { speaker: 'RESEARCHER' as const, text: 'The study introduced the Transformer architecture, eliminating sequential recurrence.' },
          { speaker: 'HOST' as const, text: 'What problem were the researchers trying to solve?' },
          { speaker: 'RESEARCHER' as const, text: 'Sequential RNN computation precluded GPU parallelization on long text.' },
          { speaker: 'HOST' as const, text: 'How did self-attention solve that?' },
          { speaker: 'RESEARCHER' as const, text: 'It connects all positions with constant number of operations.' },
          { speaker: 'HOST' as const, text: 'And the results were historic.' },
          { speaker: 'RESEARCHER' as const, text: 'A score of 28.4 BLEU, training in just 3.5 days.' },
        ];

        const pcmSegments = scriptLines.map((line) =>
          synthesizeCleanSpeechPcm(line.text, line.speaker, 24000)
        );

        const completeWav = concatenatePcmSegments(pcmSegments, 24000, 0.45);
        fs.writeFileSync(seedFile, completeWav);
        console.log('Seed podcast audio generated successfully at', seedFile);
      }
    } catch (err) {
      console.error('Error generating seed audio:', err);
    }
  }
}

export const storageService = new StorageService();
