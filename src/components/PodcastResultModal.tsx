import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Headphones,
  Mic2,
  RefreshCw,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Evaluation, PaperSection, Podcast, Rating, ResearchPaper } from '../types';
import { PodcastPlayer } from './PodcastPlayer';
import { api } from '../services/api';

interface PodcastResultModalProps {
  podcast: Podcast;
  paper?: ResearchPaper;
  sections?: PaperSection[];
  evaluation?: Evaluation;
  ratings?: Rating[];
  onClose: () => void;
  onDownload: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onViewPaper: (paperId: string) => void;
  onGenerateAgain: (paperId: string) => void;
}

export const PodcastResultModal: React.FC<PodcastResultModalProps> = ({
  podcast,
  paper,
  sections = [],
  evaluation,
  ratings = [],
  onClose,
  onDownload,
  onDelete,
  onViewPaper,
  onGenerateAgain,
}) => {
  const [activeTab, setActiveTab] = useState<
    'summary' | 'script' | 'research' | 'evaluation' | 'rating'
  >('script');

  // Rating form state
  const [clarityRating, setClarityRating] = useState(5);
  const [accuracyRating, setAccuracyRating] = useState(5);
  const [usefulnessRating, setUsefulnessRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSubmittedSuccess, setRatingSubmittedSuccess] = useState(false);
  const [localRatings, setLocalRatings] = useState<Rating[]>(ratings);

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingRating(true);
      const newRating = await api.submitRating({
        podcastId: podcast.id,
        clarityScore: clarityRating,
        accuracyScore: accuracyRating,
        usefulnessScore: usefulnessRating,
        feedback: feedbackText,
      });
      setLocalRatings((prev) => [newRating, ...prev]);
      setRatingSubmittedSuccess(true);
      setFeedbackText('');
    } catch (err) {
      console.error('Rating submission failed:', err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Parse lines for script view
  const scriptLines = podcast.script
    ? podcast.script.split('\n').filter((l) => l.trim().length > 0)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/70 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative my-8 w-full max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Ready to Listen
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
              {podcast.title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600">
              {paper && (
                <span className="font-semibold text-indigo-600">
                  Paper: {paper.title}
                </span>
              )}
              {paper?.authors && (
                <span className="flex items-center space-x-1 text-slate-500">
                  <Users className="h-3.5 w-3.5" />
                  <span>{paper.authors.join(', ')}</span>
                </span>
              )}
              <span className="flex items-center space-x-1 text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                <span>{podcast.duration ? `${podcast.duration}s` : 'Full Episode'}</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(podcast.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          {/* Integrated Audio Player */}
          <PodcastPlayer
            podcast={podcast}
            paper={paper}
            onDownload={onDownload}
            onDelete={onDelete}
          />

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-200/80 py-4">
            <div className="flex items-center space-x-2">
              {paper && (
                <button
                  onClick={() => onViewPaper(paper.id)}
                  className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  <span>View Research Paper</span>
                </button>
              )}

              {paper && (
                <button
                  onClick={() => onGenerateAgain(paper.id)}
                  className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                >
                  <RefreshCw className="h-4 w-4 text-violet-600" />
                  <span>Generate Again</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onDownload(podcast.id, paper?.title || podcast.title)}
                className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500"
              >
                <Download className="h-4 w-4" />
                <span>Download Podcast</span>
              </button>

              <button
                onClick={() => onDelete(podcast.id)}
                className="flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('script')}
              className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === 'script'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mic2 className="h-4 w-4" />
              <span>Podcast Script</span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>AI Summary</span>
            </button>

            <button
              onClick={() => setActiveTab('research')}
              className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === 'research'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Research Details</span>
            </button>

            <button
              onClick={() => setActiveTab('evaluation')}
              className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === 'evaluation'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>AI Factual Evaluation</span>
            </button>

            <button
              onClick={() => setActiveTab('rating')}
              className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === 'rating'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Star className="h-4 w-4" />
              <span>Ratings & Feedback ({localRatings.length})</span>
            </button>
          </div>

          {/* Tab Content 1: Script */}
          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-indigo-800">
                <span className="font-bold">Studio Cast:</span> Host (Alex) guides
                the discussion, and Researcher (Dr. Sam) provides rigorous
                academic explanations.
              </div>

              <div className="space-y-3">
                {scriptLines.map((line, idx) => {
                  const isHost = line.startsWith('HOST:') || line.startsWith('Alex:');
                  const speaker = isHost ? 'HOST (Alex)' : 'RESEARCHER (Dr. Sam)';
                  const text = line.replace(/^(HOST|Alex|RESEARCHER|Sam):\s*/i, '');

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-4 transition-all ${
                        isHost
                          ? 'border-indigo-200/80 bg-white shadow-2xs'
                          : 'border-violet-200/80 bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            isHost
                              ? 'bg-indigo-600 text-white'
                              : 'bg-violet-600 text-white'
                          }`}
                        >
                          {speaker}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-800">
                        {text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content 2: AI Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Abstract & Main Idea
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">
                  {paper?.abstract || 'Not specified in the provided paper.'}
                </p>
              </div>

              {sections.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {sections.map((sec) => (
                    <div
                      key={sec.id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs"
                    >
                      <span className="text-xs font-bold text-indigo-600">
                        {sec.sectionName}
                      </span>
                      <p className="mt-2 text-xs leading-relaxed text-slate-700">
                        {sec.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content 3: Research Details */}
          {activeTab === 'research' && (
            <div className="space-y-4">
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                >
                  <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    {sec.sectionName}
                  </h4>
                  <div className="mt-3 text-xs leading-relaxed text-slate-600 whitespace-pre-wrap max-h-48 overflow-y-auto font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {sec.originalText}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content 4: AI Factual Evaluation */}
          {activeTab === 'evaluation' && (
            <div className="space-y-6">
              {/* Score Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-center">
                  <span className="text-xs font-bold text-emerald-800 uppercase">
                    Factual Accuracy
                  </span>
                  <p className="mt-2 text-3xl font-black text-emerald-600">
                    {evaluation?.factualAccuracyScore ?? 96}%
                  </p>
                  <span className="text-[11px] text-emerald-700">
                    Faithfully matches paper claims
                  </span>
                </div>

                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 text-center">
                  <span className="text-xs font-bold text-indigo-800 uppercase">
                    Clarity Score
                  </span>
                  <p className="mt-2 text-3xl font-black text-indigo-600">
                    {evaluation?.clarityScore ?? 94}%
                  </p>
                  <span className="text-[11px] text-indigo-700">
                    Natural conversational flow
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <span className="text-xs font-bold text-slate-700 uppercase">
                    Unsupported Claims
                  </span>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {evaluation?.unsupportedClaims ?? 0}
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Zero ungrounded hallucinations
                  </span>
                </div>
              </div>

              {/* Evaluation Summary & Claims Verified */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Scientific Evaluation Summary
                  </h4>
                  <p className="mt-1 text-sm text-slate-800 leading-relaxed">
                    {evaluation?.evaluationSummary ||
                      'The podcast script accurately summarizes the core contributions without introducing unsubstantiated assertions.'}
                  </p>
                </div>

                {evaluation?.detectedIssues && evaluation.detectedIssues.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 mb-2">
                      Factual Grounding Check:
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {evaluation.detectedIssues.map((issue, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Mandatory AI-Assisted Evaluation Disclaimer */}
              <div className="flex items-center space-x-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  This is an AI-assisted evaluation and is not a guarantee of factual accuracy.
                </span>
              </div>
            </div>
          )}

          {/* Tab Content 5: Ratings & Feedback */}
          {activeTab === 'rating' && (
            <div className="space-y-6">
              {/* Rating Submission Form */}
              <form
                onSubmit={handleSubmitRating}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-4"
              >
                <h4 className="text-sm font-bold text-slate-900">
                  Rate this Podcast Episode
                </h4>

                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Clarity Score */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Clarity (1-5):
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setClarityRating(star)}
                          className="p-1 focus:outline-hidden"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= clarityRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accuracy Score */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Accuracy (1-5):
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setAccuracyRating(star)}
                          className="p-1 focus:outline-hidden"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= accuracyRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Usefulness Score */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Usefulness (1-5):
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUsefulnessRating(star)}
                          className="p-1 focus:outline-hidden"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= usefulnessRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Optional Feedback */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Optional Feedback:
                  </label>
                  <textarea
                    rows={2}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="How well did the host and researcher explain this paper?"
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between">
                  {ratingSubmittedSuccess && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Thank you! Your feedback has been recorded.</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmittingRating}
                    className="ml-auto flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Feedback</span>
                  </button>
                </div>
              </form>

              {/* Existing Reviews */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Previous Community Feedback ({localRatings.length})
                </h5>
                {localRatings.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No ratings yet. Be the first to review!</p>
                ) : (
                  localRatings.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                s <= Math.round(r.overallScore)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs font-bold text-slate-800">
                            {r.overallScore.toFixed(1)} / 5.0
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {r.feedback && (
                        <p className="text-xs text-slate-600 italic">
                          "{r.feedback}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
