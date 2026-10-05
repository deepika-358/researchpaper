import React from 'react';
import {
  BookOpen,
  Clock,
  Headphones,
  History,
  Mic2,
  Play,
  Plus,
  Radio,
  Star,
  Zap,
} from 'lucide-react';
import { DashboardData, Podcast, ResearchPaper } from '../types';

interface DashboardViewProps {
  data: DashboardData | null;
  onSelectPaper: (paperId: string) => void;
  onSelectPodcast: (podcastId: string) => void;
  onOpenUpload: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onSelectPaper,
  onSelectPodcast,
  onOpenUpload,
}) => {
  const stats = data?.stats || {
    totalPapers: 0,
    totalPodcasts: 0,
    totalListeningTimeSeconds: 0,
    averageRating: 0,
    totalRatingsCount: 0,
  };

  const formatListeningTime = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0m';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <section id="dashboard" className="bg-slate-50/60 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <Zap className="h-3.5 w-3.5" />
              <span>Real-Time Analytics</span>
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              Overview Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track your research repository, generated episodes, and listener engagement.
            </p>
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-violet-500 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>New Research Podcast</span>
          </button>
        </div>

        {/* 4 Key Statistics Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Total Research Papers */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Research Papers
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {stats.totalPapers}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              Stored & indexed
            </p>
          </div>

          {/* Total Podcasts */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Total Podcasts
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Headphones className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-violet-600">
              {stats.totalPodcasts}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              Two-voice episodes
            </p>
          </div>

          {/* Total Listening Time */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Listening Time
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {formatListeningTime(stats.totalListeningTimeSeconds)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              Clean studio audio
            </p>
          </div>

          {/* Average Rating */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Average Rating
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '5.0'}
              <span className="text-sm font-normal text-slate-400"> / 5.0</span>
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              {stats.totalRatingsCount} verified reviews
            </p>
          </div>
        </div>

        {/* Active Processing Widget if any */}
        {data?.activeProcessing && data.activeProcessing.length > 0 && (
          <div className="mt-8 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5">
            <div className="flex items-center space-x-2">
              <Radio className="h-4 w-4 text-indigo-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                Active Processing Pipeline ({data.activeProcessing.length})
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {data.activeProcessing.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl bg-white p-3 shadow-2xs text-xs"
                >
                  <span className="font-bold text-slate-800 truncate mr-2">
                    {p.title}
                  </span>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 font-bold text-indigo-700 uppercase text-[10px]">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2 Column Section: Recent Papers & Recent Podcasts */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Recent Papers */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Research Papers
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {data?.recentPapers.length || 0} papers
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {!data?.recentPapers || data.recentPapers.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No research papers yet. Upload one to get started!
                </p>
              ) : (
                data.recentPapers.map((paper) => (
                  <div
                    key={paper.id}
                    onClick={() => onSelectPaper(paper.id)}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 p-3 hover:border-indigo-200 hover:bg-slate-50 transition-all"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                        {paper.title}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {paper.authors.join(', ')}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-600 shrink-0">
                      View →
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Podcasts */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Headphones className="h-4 w-4 text-violet-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Podcasts
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {data?.recentPodcasts.length || 0} episodes
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {!data?.recentPodcasts || data.recentPodcasts.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No podcasts generated yet.
                </p>
              ) : (
                data.recentPodcasts.map((pod) => (
                  <div
                    key={pod.id}
                    onClick={() => onSelectPodcast(pod.id)}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 p-3 hover:border-violet-200 hover:bg-slate-50 transition-all"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="truncate text-xs font-bold text-slate-900 group-hover:text-violet-600">
                        {pod.title}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        Duration: {pod.duration ? `${pod.duration}s` : '1-2m'} • {new Date(pod.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="flex items-center space-x-1 text-[11px] font-semibold text-violet-600 shrink-0">
                      <Play className="h-3 w-3 fill-current" />
                      <span>Listen</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
