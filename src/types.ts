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
  duration: number; // seconds
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

export interface DashboardData {
  stats: {
    totalPapers: number;
    totalPodcasts: number;
    totalListeningTimeSeconds: number;
    averageRating: number;
    totalRatingsCount: number;
  };
  recentPapers: ResearchPaper[];
  recentPodcasts: Podcast[];
  recentActivity: HistoryItem[];
  activeProcessing: Podcast[];
}
