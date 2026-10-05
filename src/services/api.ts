import {
  DashboardData,
  Evaluation,
  HistoryItem,
  PaperSection,
  Podcast,
  PodcastSegment,
  Rating,
  ResearchPaper,
  SearchHistoryItem,
} from '../types';

export const api = {
  // Papers
  async getPapers(): Promise<ResearchPaper[]> {
    const res = await fetch('/api/papers');
    if (!res.ok) throw new Error('Failed to fetch research papers');
    const data = await res.json();
    return data.papers || [];
  },

  async getPaperById(
    id: string
  ): Promise<{ paper: ResearchPaper; sections: PaperSection[]; podcasts: Podcast[] }> {
    const res = await fetch(`/api/papers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch research paper details');
    return res.json();
  },

  async uploadPaper(
    file: File
  ): Promise<{ message: string; paper: ResearchPaper; sections: PaperSection[] }> {
    const formData = new FormData();
    formData.append('pdf', file);

    const res = await fetch('/api/papers/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Failed to upload and analyze paper');
    }
    return data;
  },

  async deletePaper(id: string): Promise<void> {
    const res = await fetch(`/api/papers/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete research paper');
    }
  },

  // Podcasts
  async getPodcasts(): Promise<Podcast[]> {
    const res = await fetch('/api/podcasts');
    if (!res.ok) throw new Error('Failed to fetch podcasts');
    const data = await res.json();
    return data.podcasts || [];
  },

  async getPodcastById(
    id: string
  ): Promise<{
    podcast: Podcast;
    paper?: ResearchPaper;
    segments: PodcastSegment[];
    evaluation?: Evaluation;
    ratings: Rating[];
  }> {
    const res = await fetch(`/api/podcasts/${id}`);
    if (!res.ok) throw new Error('Failed to fetch podcast details');
    return res.json();
  },

  async generatePodcast(paperId: string): Promise<Podcast> {
    const res = await fetch('/api/podcasts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paperId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to initiate podcast generation');
    }
    return data.podcast;
  },

  async deletePodcast(id: string): Promise<void> {
    const res = await fetch(`/api/podcasts/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete podcast');
    }
  },

  getPodcastDownloadUrl(id: string): string {
    return `/api/podcasts/${id}/download`;
  },

  // Evaluations
  async getEvaluation(podcastId: string): Promise<Evaluation> {
    const res = await fetch(`/api/evaluations/${podcastId}`);
    if (!res.ok) throw new Error('Failed to fetch evaluation');
    const data = await res.json();
    return data.evaluation;
  },

  // Ratings
  async submitRating(payload: {
    podcastId: string;
    clarityScore: number;
    accuracyScore: number;
    usefulnessScore: number;
    feedback?: string;
  }): Promise<Rating> {
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit rating');
    return data.rating;
  },

  async getRatings(podcastId: string): Promise<Rating[]> {
    const res = await fetch(`/api/ratings/${podcastId}`);
    if (!res.ok) throw new Error('Failed to fetch ratings');
    const data = await res.json();
    return data.ratings || [];
  },

  // Search
  async search(
    query: string,
    filter = 'all'
  ): Promise<{
    papers: ResearchPaper[];
    podcasts: Podcast[];
    totalCount: number;
  }> {
    const params = new URLSearchParams({ q: query, filter });
    const res = await fetch(`/api/search?${params.toString()}`);
    if (!res.ok) throw new Error('Search request failed');
    return res.json();
  },

  // History
  async getHistory(): Promise<{
    history: HistoryItem[];
    searchHistory: SearchHistoryItem[];
  }> {
    const res = await fetch('/api/history');
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async clearHistory(): Promise<void> {
    const res = await fetch('/api/history', { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear history');
  },

  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },
};
