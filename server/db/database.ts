import fs from 'fs';
import path from 'path';

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  publicationDate: string;
  keywords: string[];
  processingStatus: 'queued' | 'extracting' | 'summarizing' | 'completed' | 'failed';
}

export interface PaperSection {
  id: string;
  paperId: string;
  sectionName: string;
  originalText: string;
  summary: string;
  orderIndex: number;
}

export interface PodcastSegment {
  id: string;
  podcastId: string;
  speaker: 'HOST' | 'RESEARCHER';
  text: string;
  audioUrl?: string;
  sequence: number;
  duration?: number;
}

export interface Podcast {
  id: string;
  paperId: string;
  title: string;
  script: string;
  audioUrl: string;
  audioFormat: string;
  duration: number; // in seconds
  status:
    | 'queued'
    | 'extracting'
    | 'summarizing'
    | 'script_generating'
    | 'host_audio_generating'
    | 'researcher_audio_generating'
    | 'audio_processing'
    | 'completed'
    | 'failed';
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Evaluation {
  id: string;
  podcastId: string;
  factualAccuracyScore: number;
  clarityScore: number;
  unsupportedClaims: number;
  detectedIssues: string[];
  evaluationSummary: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  podcastId: string;
  clarityScore: number;
  accuracyScore: number;
  usefulnessScore: number;
  overallScore: number;
  feedback?: string;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  actionType:
    | 'paper_uploaded'
    | 'paper_viewed'
    | 'podcast_generated'
    | 'podcast_played'
    | 'podcast_downloaded'
    | 'podcast_deleted'
    | 'paper_deleted'
    | 'search_performed'
    | 'rating_submitted';
  paperId?: string;
  podcastId?: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  searchedAt: string;
}

interface DatabaseSchema {
  papers: ResearchPaper[];
  sections: PaperSection[];
  podcasts: Podcast[];
  segments: PodcastSegment[];
  evaluations: Evaluation[];
  ratings: Rating[];
  history: HistoryItem[];
  searchHistory: SearchHistoryItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'papercast_db.json');

class Database {
  private data: DatabaseSchema = {
    papers: [],
    sections: [],
    podcasts: [],
    segments: [],
    evaluations: [],
    ratings: [],
    history: [],
    searchHistory: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.persist();
      }
    } catch (err) {
      console.error('Error initializing database, using seed data:', err);
      this.seedInitialData();
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  // --- Papers ---
  public getPapers(): ResearchPaper[] {
    return [...this.data.papers].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  public getPaperById(id: string): ResearchPaper | undefined {
    return this.data.papers.find((p) => p.id === id);
  }

  public createPaper(paper: ResearchPaper): ResearchPaper {
    this.data.papers.push(paper);
    this.addHistory({
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      actionType: 'paper_uploaded',
      paperId: paper.id,
      timestamp: new Date().toISOString(),
      metadata: { title: paper.title, fileName: paper.fileName },
    });
    this.persist();
    return paper;
  }

  public updatePaper(id: string, updates: Partial<ResearchPaper>): ResearchPaper | null {
    const idx = this.data.papers.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.papers[idx] = { ...this.data.papers[idx], ...updates };
    this.persist();
    return this.data.papers[idx];
  }

  public deletePaper(id: string): boolean {
    const idx = this.data.papers.findIndex((p) => p.id === id);
    if (idx === -1) return false;

    const paper = this.data.papers[idx];
    this.data.papers.splice(idx, 1);

    // Cascade delete sections
    this.data.sections = this.data.sections.filter((s) => s.paperId !== id);

    // Cascade delete associated podcasts and their segments/evaluations/ratings
    const podcastsToDelete = this.data.podcasts.filter((pod) => pod.paperId === id);
    for (const pod of podcastsToDelete) {
      this.deletePodcast(pod.id, false);
    }

    this.addHistory({
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      actionType: 'paper_deleted',
      paperId: id,
      timestamp: new Date().toISOString(),
      metadata: { title: paper.title },
    });

    this.persist();
    return true;
  }

  // --- Sections ---
  public getSectionsByPaperId(paperId: string): PaperSection[] {
    return this.data.sections
      .filter((s) => s.paperId === paperId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  public setPaperSections(paperId: string, sections: PaperSection[]): void {
    this.data.sections = this.data.sections.filter((s) => s.paperId !== paperId);
    this.data.sections.push(...sections);
    this.persist();
  }

  // --- Podcasts ---
  public getPodcasts(): Podcast[] {
    return [...this.data.podcasts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getPodcastById(id: string): Podcast | undefined {
    return this.data.podcasts.find((p) => p.id === id);
  }

  public getPodcastsByPaperId(paperId: string): Podcast[] {
    return this.data.podcasts.filter((p) => p.paperId === paperId);
  }

  public createPodcast(podcast: Podcast): Podcast {
    this.data.podcasts.push(podcast);
    this.addHistory({
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      actionType: 'podcast_generated',
      paperId: podcast.paperId,
      podcastId: podcast.id,
      timestamp: new Date().toISOString(),
      metadata: { title: podcast.title },
    });
    this.persist();
    return podcast;
  }

  public updatePodcast(id: string, updates: Partial<Podcast>): Podcast | null {
    const idx = this.data.podcasts.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.podcasts[idx] = { ...this.data.podcasts[idx], ...updates };
    this.persist();
    return this.data.podcasts[idx];
  }

  public deletePodcast(id: string, logHistory = true): boolean {
    const idx = this.data.podcasts.findIndex((p) => p.id === id);
    if (idx === -1) return false;

    const podcast = this.data.podcasts[idx];
    this.data.podcasts.splice(idx, 1);

    // Cascade delete segments, evaluation, and ratings
    this.data.segments = this.data.segments.filter((s) => s.podcastId !== id);
    this.data.evaluations = this.data.evaluations.filter((e) => e.podcastId !== id);
    this.data.ratings = this.data.ratings.filter((r) => r.podcastId !== id);

    if (logHistory) {
      this.addHistory({
        id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        actionType: 'podcast_deleted',
        podcastId: id,
        timestamp: new Date().toISOString(),
        metadata: { title: podcast.title },
      });
    }

    this.persist();
    return true;
  }

  // --- Segments ---
  public getSegmentsByPodcastId(podcastId: string): PodcastSegment[] {
    return this.data.segments
      .filter((s) => s.podcastId === podcastId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  public setPodcastSegments(podcastId: string, segments: PodcastSegment[]): void {
    this.data.segments = this.data.segments.filter((s) => s.podcastId !== podcastId);
    this.data.segments.push(...segments);
    this.persist();
  }

  // --- Evaluations ---
  public getEvaluationByPodcastId(podcastId: string): Evaluation | undefined {
    return this.data.evaluations.find((e) => e.podcastId === podcastId);
  }

  public setEvaluation(evaluation: Evaluation): Evaluation {
    const idx = this.data.evaluations.findIndex((e) => e.podcastId === evaluation.podcastId);
    if (idx !== -1) {
      this.data.evaluations[idx] = evaluation;
    } else {
      this.data.evaluations.push(evaluation);
    }
    this.persist();
    return evaluation;
  }

  // --- Ratings ---
  public getRatingsByPodcastId(podcastId: string): Rating[] {
    return this.data.ratings.filter((r) => r.podcastId === podcastId);
  }

  public getAllRatings(): Rating[] {
    return this.data.ratings;
  }

  public addRating(rating: Rating): Rating {
    this.data.ratings.push(rating);
    this.addHistory({
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      actionType: 'rating_submitted',
      podcastId: rating.podcastId,
      timestamp: new Date().toISOString(),
      metadata: { overallScore: rating.overallScore, feedback: rating.feedback },
    });
    this.persist();
    return rating;
  }

  // --- History ---
  public getHistory(): HistoryItem[] {
    return [...this.data.history].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public addHistory(item: HistoryItem): void {
    this.data.history.unshift(item);
    if (this.data.history.length > 200) {
      this.data.history = this.data.history.slice(0, 200);
    }
    this.persist();
  }

  public clearHistory(): void {
    this.data.history = [];
    this.data.searchHistory = [];
    this.persist();
  }

  // --- Search History ---
  public addSearchQuery(query: string): void {
    if (!query || query.trim().length === 0) return;
    this.data.searchHistory.unshift({
      id: 'search-' + Date.now(),
      query: query.trim(),
      searchedAt: new Date().toISOString(),
    });
    if (this.data.searchHistory.length > 50) {
      this.data.searchHistory = this.data.searchHistory.slice(0, 50);
    }
    this.addHistory({
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      actionType: 'search_performed',
      timestamp: new Date().toISOString(),
      metadata: { query: query.trim() },
    });
    this.persist();
  }

  public getSearchHistory(): SearchHistoryItem[] {
    return this.data.searchHistory;
  }

  // --- Seed Data for Instant Experience ---
  private seedInitialData() {
    const paper1: ResearchPaper = {
      id: 'paper-seed-1',
      title: 'Attention Is All You Need: The Dominance of Self-Attention Mechanisms',
      authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Aidan N. Gomez'],
      abstract:
        'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output.',
      fileUrl: '/storage/papers/sample-attention.pdf',
      fileName: 'vaswani_attention_is_all_you_need.pdf',
      fileSize: 2211840,
      uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      publicationDate: '2017-06-12',
      keywords: ['Transformer', 'Self-Attention', 'NLP', 'Sequence Transduction', 'Deep Learning'],
      processingStatus: 'completed',
    };

    const paper2: ResearchPaper = {
      id: 'paper-seed-2',
      title: 'Deep Residual Learning for Image Recognition: Addressing the Vanishing Gradient',
      authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
      abstract:
        'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions.',
      fileUrl: '/storage/papers/sample-resnet.pdf',
      fileName: 'he_deep_residual_learning.pdf',
      fileSize: 1845200,
      uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      publicationDate: '2015-12-10',
      keywords: ['ResNet', 'Computer Vision', 'Deep Residual Learning', 'ImageNet', 'Neural Networks'],
      processingStatus: 'completed',
    };

    const sectionsPaper1: PaperSection[] = [
      {
        id: 'sec-1-1',
        paperId: 'paper-seed-1',
        sectionName: 'Abstract',
        originalText: paper1.abstract,
        summary:
          'Proposes the Transformer architecture, replacing recurrent and convolutional layers entirely with multi-head self-attention mechanisms for sequence-to-sequence modeling.',
        orderIndex: 0,
      },
      {
        id: 'sec-1-2',
        paperId: 'paper-seed-1',
        sectionName: 'Introduction',
        originalText:
          'Recurrent neural networks, especially LSTM and GRU, have been established as state of the art in sequence modeling. However, sequential computation precludes parallelization within training examples, which becomes critical at longer sequence lengths.',
        summary:
          'Recurrence introduces a fundamental bottleneck: processing step-by-step prevents GPU parallelization across token sequences.',
        orderIndex: 1,
      },
      {
        id: 'sec-1-3',
        paperId: 'paper-seed-1',
        sectionName: 'Methodology',
        originalText:
          'The Transformer uses stacked self-attention and point-wise, fully connected layers for both encoder and decoder. Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.',
        summary:
          'Encoder and decoder stacks with Multi-Head Attention, Scaled Dot-Product Attention (Q, K, V with dimension dk=64), and sinusoidal positional encodings.',
        orderIndex: 2,
      },
      {
        id: 'sec-1-4',
        paperId: 'paper-seed-1',
        sectionName: 'Results',
        originalText:
          'On the WMT 2014 English-to-German translation task, the big transformer model achieves 28.4 BLEU, outperforming existing models by over 2.0 BLEU. On English-to-French, it established a state-of-the-art BLEU score of 41.8 after training for 3.5 days on 8 GPUs.',
        summary:
          'Achieved 28.4 BLEU score on English-German (2.0+ improvement) and 41.8 BLEU on English-French, while reducing training cost to 3.5 days on 8 P100 GPUs.',
        orderIndex: 3,
      },
      {
        id: 'sec-1-5',
        paperId: 'paper-seed-1',
        sectionName: 'Conclusion',
        originalText:
          'We presented the Transformer, the first sequence transduction model based entirely on attention, replacing recurrent layers with multi-headed self-attention.',
        summary:
          'Proved that attention alone without recurrence or convolution achieves superior translation quality with dramatically faster training.',
        orderIndex: 4,
      },
    ];

    const podcast1: Podcast = {
      id: 'pod-seed-1',
      paperId: 'paper-seed-1',
      title: 'Episode 1: Why Attention Conquered Artificial Intelligence',
      script: `HOST: Welcome to PaperCast AI. Today we are diving into one of the most consequential machine learning papers of our decade: "Attention Is All You Need".
RESEARCHER: It is wonderful to be here. This paper revolutionized natural language processing by dismantling a decade-old belief that neural networks needed recurrence or memory loops to understand sequences.
HOST: What exact challenge were the researchers trying to solve?
RESEARCHER: At the time, models relied on Recurrent Neural Networks and LSTMs. They processed text word by word, step by step. That sequential dependency meant you could not easily parallelize training across modern GPUs.
HOST: How did the authors break through that bottleneck?
RESEARCHER: By proposing the Transformer. Instead of sequential passing, it uses Multi-Head Self-Attention. The model examines all words simultaneously and calculates mathematical attention weights between every single token pair.
HOST: And what were the concrete empirical results?
RESEARCHER: On the benchmark WMT English-to-German task, they achieved an unprecedented 28.4 BLEU score—surpassing existing ensembles by over 2.0 BLEU—while training in just 3.5 days on eight GPUs.
HOST: That computational efficiency enabled models like GPT and modern LLMs to exist today. What a monumental foundation. Thank you for walking us through it.
RESEARCHER: My pleasure. It is a masterclass in elegant architectural simplicity.`,
      audioUrl: '/api/storage/audio/seed-transformer.wav',
      audioFormat: 'audio/wav',
      duration: 112,
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 19.9).toISOString(),
    };

    const segments1: PodcastSegment[] = [
      {
        id: 'seg-1-1',
        podcastId: 'pod-seed-1',
        speaker: 'HOST',
        text: 'Welcome to PaperCast AI. Today we are diving into one of the most consequential machine learning papers of our decade: "Attention Is All You Need".',
        sequence: 1,
        duration: 9,
      },
      {
        id: 'seg-1-2',
        podcastId: 'pod-seed-1',
        speaker: 'RESEARCHER',
        text: 'It is wonderful to be here. This paper revolutionized natural language processing by dismantling a decade-old belief that neural networks needed recurrence or memory loops to understand sequences.',
        sequence: 2,
        duration: 12,
      },
      {
        id: 'seg-1-3',
        podcastId: 'pod-seed-1',
        speaker: 'HOST',
        text: 'What exact challenge were the researchers trying to solve?',
        sequence: 3,
        duration: 4,
      },
      {
        id: 'seg-1-4',
        podcastId: 'pod-seed-1',
        speaker: 'RESEARCHER',
        text: 'At the time, models relied on Recurrent Neural Networks and LSTMs. They processed text word by word, step by step. That sequential dependency meant you could not easily parallelize training across modern GPUs.',
        sequence: 5,
        duration: 14,
      },
      {
        id: 'seg-1-5',
        podcastId: 'pod-seed-1',
        speaker: 'HOST',
        text: 'How did the authors break through that bottleneck?',
        sequence: 6,
        duration: 4,
      },
      {
        id: 'seg-1-6',
        podcastId: 'pod-seed-1',
        speaker: 'RESEARCHER',
        text: 'By proposing the Transformer. Instead of sequential passing, it uses Multi-Head Self-Attention. The model examines all words simultaneously and calculates mathematical attention weights between every single token pair.',
        sequence: 7,
        duration: 15,
      },
      {
        id: 'seg-1-7',
        podcastId: 'pod-seed-1',
        speaker: 'HOST',
        text: 'And what were the concrete empirical results?',
        sequence: 8,
        duration: 4,
      },
      {
        id: 'seg-1-8',
        podcastId: 'pod-seed-1',
        speaker: 'RESEARCHER',
        text: 'On the benchmark WMT English-to-German task, they achieved an unprecedented 28.4 BLEU score—surpassing existing ensembles by over 2.0 BLEU—while training in just 3.5 days on eight GPUs.',
        sequence: 9,
        duration: 13,
      },
      {
        id: 'seg-1-9',
        podcastId: 'pod-seed-1',
        speaker: 'HOST',
        text: 'That computational efficiency enabled models like GPT and modern LLMs to exist today. What a monumental foundation. Thank you for walking us through it.',
        sequence: 10,
        duration: 9,
      },
      {
        id: 'seg-1-10',
        podcastId: 'pod-seed-1',
        speaker: 'RESEARCHER',
        text: 'My pleasure. It is a masterclass in elegant architectural simplicity.',
        sequence: 11,
        duration: 5,
      },
    ];

    const evaluation1: Evaluation = {
      id: 'eval-seed-1',
      podcastId: 'pod-seed-1',
      factualAccuracyScore: 98,
      clarityScore: 96,
      unsupportedClaims: 0,
      detectedIssues: [
        'Verified: 28.4 BLEU score matches Table 2 in original paper.',
        'Verified: 3.5 days on 8 GPUs matches Section 5 training setup.',
        'Verified: Recurrence replacement with self-attention accurately reflects architectural innovation.',
      ],
      evaluationSummary:
        'The conversational script demonstrates exceptional fidelity to the original research paper. Numerical metrics and architectural specifics are maintained without hallucination or unsupported claims.',
      createdAt: new Date(Date.now() - 3600000 * 19.8).toISOString(),
    };

    const rating1: Rating = {
      id: 'rate-seed-1',
      podcastId: 'pod-seed-1',
      clarityScore: 5,
      accuracyScore: 5,
      usefulnessScore: 5,
      overallScore: 5,
      feedback: 'Incredible breakdown. The two distinct voices make grasping the Transformer architecture effortless!',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    };

    this.data.papers = [paper1, paper2];
    this.data.sections = sectionsPaper1;
    this.data.podcasts = [podcast1];
    this.data.segments = segments1;
    this.data.evaluations = [evaluation1];
    this.data.ratings = [rating1];
    this.data.history = [
      {
        id: 'hist-seed-1',
        actionType: 'paper_uploaded',
        paperId: paper1.id,
        timestamp: paper1.uploadedAt,
        metadata: { title: paper1.title, fileName: paper1.fileName },
      },
      {
        id: 'hist-seed-2',
        actionType: 'podcast_generated',
        paperId: paper1.id,
        podcastId: podcast1.id,
        timestamp: podcast1.createdAt,
        metadata: { title: podcast1.title },
      },
      {
        id: 'hist-seed-3',
        actionType: 'podcast_played',
        paperId: paper1.id,
        podcastId: podcast1.id,
        timestamp: new Date(Date.now() - 3600000 * 19).toISOString(),
        metadata: { duration: 112 },
      },
    ];
    this.data.searchHistory = [
      { id: 'search-1', query: 'Attention Is All You Need', searchedAt: new Date(Date.now() - 3600000 * 5).toISOString() },
      { id: 'search-2', query: 'Transformer', searchedAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    ];
  }
}

export const db = new Database();
