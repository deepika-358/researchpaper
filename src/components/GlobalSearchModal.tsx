import React, { useEffect, useState } from 'react';
import {
  FileText,
  Headphones,
  Loader2,
  Search,
  Sparkles,
  X,
  Play,
  Eye,
} from 'lucide-react';
import { Podcast, ResearchPaper } from '../types';
import { api } from '../services/api';

interface GlobalSearchModalProps {
  onClose: () => void;
  onSelectPaper: (paperId: string) => void;
  onSelectPodcast: (podcastId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  onClose,
  onSelectPaper,
  onSelectPodcast,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'papers', label: 'Research Papers' },
    { id: 'podcasts', label: 'Podcasts' },
    { id: 'recent', label: 'Recent' },
    { id: 'completed', label: 'Completed' },
    { id: 'processing', label: 'Processing' },
  ];

  const executeSearch = async (searchTerm: string, filter: string) => {
    try {
      setLoading(true);
      const res = await api.search(searchTerm, filter);
      setPapers(res.papers || []);
      setPodcasts(res.podcasts || []);
      setHasSearched(true);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    executeSearch('', 'all');
  }, []);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    executeSearch(query, filterId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeSearch(query, activeFilter);
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const totalResults = papers.length + podcasts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 pt-16 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Search Bar Input */}
        <div className="relative flex items-center border-b border-slate-200 pb-4">
          <Search className="h-5 w-5 text-slate-400 absolute left-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search papers, podcasts, authors, or topics..."
            className="w-full rounded-2xl bg-slate-50 pl-11 pr-24 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute right-3 flex items-center space-x-2">
            <button
              onClick={() => executeSearch(query, activeFilter)}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500"
            >
              Search
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                activeFilter === f.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="mt-6 max-h-[60vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-2 text-xs font-medium">Searching database...</p>
            </div>
          ) : totalResults === 0 && hasSearched ? (
            <div className="py-12 text-center">
              <p className="text-base font-bold text-slate-900">
                No matching research papers or podcasts found.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try searching for keywords like "Transformer", "Attention", or authors.
              </p>
            </div>
          ) : (
            <>
              {/* Matching Papers */}
              {papers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Research Papers ({papers.length})
                  </h4>
                  <div className="space-y-2">
                    {papers.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectPaper(p.id);
                          onClose();
                        }}
                        className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                              {p.title}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">
                              {p.authors.join(', ')} • {p.publicationDate}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold text-indigo-600 shrink-0 ml-2">
                          View Paper →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Podcasts */}
              {podcasts.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Podcasts ({podcasts.length})
                  </h4>
                  <div className="space-y-2">
                    {podcasts.map((pod) => (
                      <div
                        key={pod.id}
                        onClick={() => {
                          onSelectPodcast(pod.id);
                          onClose();
                        }}
                        className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:border-violet-300 hover:bg-violet-50/30 transition-all"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <Headphones className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-900 group-hover:text-violet-600">
                              {pod.title}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">
                              Duration: {pod.duration ? `${pod.duration}s` : 'Full'} • Status: {pod.status}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold text-violet-600 shrink-0 ml-2">
                          Play Episode →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
