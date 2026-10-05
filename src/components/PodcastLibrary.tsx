import React from 'react';
import {
  Calendar,
  Clock,
  Download,
  Eye,
  Headphones,
  Mic2,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import { Podcast, ResearchPaper } from '../types';

interface PodcastLibraryProps {
  podcasts: Podcast[];
  papers: ResearchPaper[];
  onPlay: (podcast: Podcast) => void;
  onView: (podcastId: string) => void;
  onDownload: (podcastId: string, title: string) => void;
  onDelete: (podcastId: string) => void;
  onOpenUpload: () => void;
}

export const PodcastLibrary: React.FC<PodcastLibraryProps> = ({
  podcasts,
  papers,
  onPlay,
  onView,
  onDownload,
  onDelete,
  onOpenUpload,
}) => {
  return (
    <section id="podcasts" className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
              <Headphones className="h-3.5 w-3.5" />
              <span>Two-Speaker Audio Shows</span>
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              My Podcasts
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Listen, download, and manage your generated research episodes.
            </p>
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 transition-all self-start sm:self-auto"
          >
            <Mic2 className="h-4 w-4" />
            <span>Generate New Podcast</span>
          </button>
        </div>

        {/* Empty State */}
        {podcasts.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Headphones className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No podcasts generated yet.
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Upload an academic paper to generate your first two-speaker conversation.
            </p>
            <button
              onClick={onOpenUpload}
              className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Podcast</span>
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {podcasts.map((podcast) => {
              const paper = papers.find((p) => p.id === podcast.paperId);

              return (
                <div
                  key={podcast.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/10"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                          {podcast.status === 'completed' ? 'Studio Audio Ready' : podcast.status}
                        </span>
                      </div>

                      <span className="flex items-center space-x-1 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                        <Clock className="h-3 w-3" />
                        <span>{podcast.duration ? `${podcast.duration}s` : '1-2m'}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onView(podcast.id)}
                      className="mt-4 cursor-pointer text-base font-bold text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors"
                      title={podcast.title}
                    >
                      {podcast.title}
                    </h3>

                    {/* Paper Title */}
                    <p className="mt-1 text-xs text-indigo-600 font-medium line-clamp-1">
                      Paper: {paper ? paper.title : 'Academic Research Paper'}
                    </p>

                    {/* Script Snippet */}
                    <p className="mt-3 text-xs text-slate-500 italic line-clamp-2">
                      {podcast.script
                        ? podcast.script.substring(0, 140) + '...'
                        : 'Two-speaker discussion between Host and Researcher.'}
                    </p>

                    {/* Date */}
                    <div className="mt-4 flex items-center space-x-1.5 text-[11px] text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(podcast.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onPlay(podcast)}
                        className="flex items-center space-x-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-500"
                        title="Play in audio player"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Play</span>
                      </button>

                      <button
                        onClick={() => onView(podcast.id)}
                        className="flex items-center space-x-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        title="View episode details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => onDownload(podcast.id, paper?.title || podcast.title)}
                        className="flex items-center space-x-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        title="Download MP3/WAV"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onDelete(podcast.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete Podcast"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
