import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Download,
  FileText,
  Headphones,
  Mic2,
  Trash2,
  Users,
  X,
  Layers,
} from 'lucide-react';
import { PaperSection, Podcast, ResearchPaper } from '../types';

interface PaperDetailModalProps {
  paper: ResearchPaper;
  sections: PaperSection[];
  podcasts: Podcast[];
  onClose: () => void;
  onCreatePodcast: (paperId: string) => void;
  onListenPodcast: (podcastId: string) => void;
  onDeletePaper: (paperId: string) => void;
}

export const PaperDetailModal: React.FC<PaperDetailModalProps> = ({
  paper,
  sections,
  podcasts,
  onClose,
  onCreatePodcast,
  onListenPodcast,
  onDeletePaper,
}) => {
  const [activeSection, setActiveSection] = useState<string>(
    sections[0]?.sectionName || 'Abstract'
  );

  const completedPodcast = podcasts.find((p) => p.status === 'completed');
  const currentSection = sections.find((s) => s.sectionName === activeSection) || sections[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/70 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative my-8 w-full max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Research Paper Overview
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Header Info */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {paper.title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600">
              <span className="flex items-center space-x-1">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-semibold">{paper.authors.join(', ')}</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Uploaded {new Date(paper.uploadedAt).toLocaleDateString()}</span>
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                {(paper.fileSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>

            {/* Keywords */}
            {paper.keywords && paper.keywords.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {paper.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-indigo-100 bg-indigo-50/60 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-200/80 py-4">
            <div className="flex items-center space-x-3">
              {completedPodcast ? (
                <button
                  onClick={() => onListenPodcast(completedPodcast.id)}
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-violet-500"
                >
                  <Headphones className="h-4 w-4" />
                  <span>Listen to Podcast</span>
                </button>
              ) : (
                <button
                  onClick={() => onCreatePodcast(paper.id)}
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-violet-500"
                >
                  <Mic2 className="h-4 w-4" />
                  <span>Generate Podcast</span>
                </button>
              )}
            </div>

            <button
              onClick={() => onDeletePaper(paper.id)}
              className="flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Research Paper</span>
            </button>
          </div>

          {/* Sections Navigation & Content */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Layers className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Detected Research Sections ({sections.length})
              </h3>
            </div>

            {/* Section Tabs */}
            <div className="flex space-x-2 overflow-x-auto border-b border-slate-200 pb-2">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.sectionName)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                    activeSection === sec.sectionName
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sec.sectionName}
                </button>
              ))}
            </div>

            {/* Current Section Body */}
            {currentSection && (
              <div className="mt-4 space-y-4">
                {/* AI Section Summary */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    AI Section Summary
                  </h4>
                  <p className="mt-1 text-sm text-slate-800 leading-relaxed">
                    {currentSection.summary}
                  </p>
                </div>

                {/* Original Extracted Text */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Extracted Text from PDF
                  </h4>
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-xl bg-slate-50 p-3 font-mono text-xs text-slate-700 whitespace-pre-wrap border border-slate-100">
                    {currentSection.originalText}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
