import React from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  Mic2,
  Sparkles,
  Volume2,
  AlertTriangle,
} from 'lucide-react';
import { Podcast } from '../types';

interface ProcessingScreenProps {
  currentStage: Podcast['status'];
  paperTitle: string;
  errorMessage?: string;
  onCancel?: () => void;
  onViewCompleted?: () => void;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  currentStage,
  paperTitle,
  errorMessage,
  onCancel,
  onViewCompleted,
}) => {
  const stages = [
    { key: 'queued', label: 'PDF uploaded' },
    { key: 'extracting', label: 'Text extracted' },
    { key: 'summarizing', label: 'Sections identified & summarized' },
    { key: 'script_generating', label: 'Podcast conversation created' },
    { key: 'host_audio_generating', label: 'Generating Host voice' },
    { key: 'researcher_audio_generating', label: 'Generating Researcher voice' },
    { key: 'audio_processing', label: 'Cleaning audio & studio normalization' },
    { key: 'completed', label: 'Finalizing podcast & ready to listen' },
  ];

  const getStageIndex = (stage: Podcast['status']): number => {
    switch (stage) {
      case 'queued':
        return 0;
      case 'extracting':
        return 1;
      case 'summarizing':
        return 2;
      case 'script_generating':
        return 3;
      case 'host_audio_generating':
        return 4;
      case 'researcher_audio_generating':
        return 5;
      case 'audio_processing':
        return 6;
      case 'completed':
        return 7;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(currentStage);
  const isFailed = currentStage === 'failed';
  const isCompleted = currentStage === 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
        {/* Glow Element */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl" />

        {/* Modal Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            {isFailed ? (
              <AlertTriangle className="h-7 w-7 text-amber-300" />
            ) : isCompleted ? (
              <CheckCircle2 className="h-7 w-7 text-emerald-300 animate-bounce" />
            ) : (
              <Mic2 className="h-7 w-7 animate-pulse" />
            )}
          </div>

          <h3 className="mt-4 text-xl font-extrabold text-slate-900 sm:text-2xl">
            {isFailed
              ? 'Transformation Issue'
              : isCompleted
              ? 'Podcast Ready!'
              : 'AI is transforming your research...'}
          </h3>

          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            {paperTitle || 'Academic Research Paper'}
          </p>
        </div>

        {/* Error State */}
        {isFailed ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm font-semibold text-red-800">
              {errorMessage || 'Podcast generation failed. Please try again.'}
            </p>
            <div className="mt-5 flex justify-center space-x-3">
              <button
                onClick={onCancel}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-500"
              >
                Close & Try Again
              </button>
            </div>
          </div>
        ) : (
          /* Step-by-Step Progress Pipeline */
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            {stages.map((stage, idx) => {
              const isDone = idx < currentIndex || isCompleted;
              const isCurrent = idx === currentIndex && !isCompleted;
              const isPending = idx > currentIndex && !isCompleted;

              return (
                <div
                  key={stage.key}
                  className={`flex items-center space-x-3 rounded-xl px-3 py-2 transition-all ${
                    isCurrent
                      ? 'bg-white shadow-xs border border-indigo-200'
                      : isDone
                      ? 'text-slate-700'
                      : 'text-slate-400 opacity-60'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 text-indigo-600 animate-spin shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                  )}

                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-indigo-700 font-bold'
                        : isDone
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>

                  {isCurrent && (
                    <span className="ml-auto text-[10px] font-bold text-indigo-600 uppercase tracking-wider animate-pulse">
                      Processing...
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        {isCompleted && (
          <div className="mt-6">
            <button
              onClick={onViewCompleted}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Open & Listen to Podcast</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
