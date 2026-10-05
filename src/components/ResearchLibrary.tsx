import React from 'react';
import {
  BookOpen,
  Calendar,
  Download,
  FileText,
  Headphones,
  Mic2,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { Podcast, ResearchPaper } from '../types';

interface ResearchLibraryProps {
  papers: ResearchPaper[];
  podcasts: Podcast[];
  onViewPaper: (paperId: string) => void;
  onCreatePodcast: (paperId: string) => void;
  onListenPodcast: (podcastId: string) => void;
  onDeletePaper: (paperId: string) => void;
  onOpenUpload: () => void;
}

export const ResearchLibrary: React.FC<ResearchLibraryProps> = ({
  papers,
  podcasts,
  onViewPaper,
  onCreatePodcast,
  onListenPodcast,
  onDeletePaper,
  onOpenUpload,
}) => {
  return (
    <section id="library" className="bg-slate-50/70 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Real Database Store</span>
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              My Research Library
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Browse stored academic papers, extracted sections, and generated episodes.
            </p>
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Upload New Paper</span>
          </button>
        </div>

        {/* Papers Grid or Empty State */}
        {papers.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No research papers yet.
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Upload your first paper and turn it into a podcast.
            </p>
            <button
              onClick={onOpenUpload}
              className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Research Paper</span>
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => {
              const paperPodcasts = podcasts.filter((p) => p.paperId === paper.id);
              const completedPodcast = paperPodcasts.find((p) => p.status === 'completed');

              return (
                <div
                  key={paper.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10"
                >
                  <div>
                    {/* Top Row: PDF Icon & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                        <FileText className="h-6 w-6" />
                      </div>

                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                        {paper.fileSize ? `${(paper.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'PDF'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onViewPaper(paper.id)}
                      className="mt-4 cursor-pointer text-base font-bold text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors"
                      title={paper.title}
                    >
                      {paper.title}
                    </h3>

                    {/* Authors */}
                    <p className="mt-1 flex items-center space-x-1 text-xs text-slate-500 line-clamp-1">
                      <Users className="h-3 w-3 shrink-0" />
                      <span>{paper.authors.join(', ') || 'Research Authors'}</span>
                    </p>

                    {/* Abstract preview */}
                    <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {paper.abstract}
                    </p>

                    {/* Date */}
                    <div className="mt-4 flex items-center space-x-1.5 text-[11px] text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>Uploaded {new Date(paper.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewPaper(paper.id)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        title="View Paper Details"
                      >
                        View
                      </button>

                      {completedPodcast ? (
                        <button
                          onClick={() => onListenPodcast(completedPodcast.id)}
                          className="flex items-center space-x-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                          title="Listen to Podcast"
                        >
                          <Headphones className="h-3.5 w-3.5" />
                          <span>Listen</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onCreatePodcast(paper.id)}
                          className="flex items-center space-x-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-indigo-500"
                          title="Generate Podcast"
                        >
                          <Mic2 className="h-3.5 w-3.5" />
                          <span>Cast</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onDeletePaper(paper.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete Research Paper"
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
