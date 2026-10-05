import React, { useEffect, useState } from 'react';
import {
  Clock,
  Download,
  FileText,
  Headphones,
  History,
  Mic2,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { HistoryItem, SearchHistoryItem } from '../types';
import { api } from '../services/api';

interface HistoryModalProps {
  onClose: () => void;
  onSelectPaper?: (paperId: string) => void;
  onSelectPodcast?: (podcastId: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  onClose,
  onSelectPaper,
  onSelectPodcast,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getHistory();
      setHistoryItems(data.history || []);
      setSearchHistory(data.searchHistory || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear your entire activity history?')) {
      await api.clearHistory();
      setHistoryItems([]);
      setSearchHistory([]);
    }
  };

  const getActionIcon = (type: HistoryItem['actionType']) => {
    switch (type) {
      case 'paper_uploaded':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'paper_viewed':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      case 'podcast_generated':
        return <Mic2 className="h-4 w-4 text-violet-500" />;
      case 'podcast_played':
        return <Headphones className="h-4 w-4 text-emerald-500" />;
      case 'podcast_downloaded':
        return <Download className="h-4 w-4 text-teal-500" />;
      case 'search_performed':
        return <Search className="h-4 w-4 text-amber-500" />;
      case 'rating_submitted':
        return <Star className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getActionLabel = (item: HistoryItem) => {
    switch (item.actionType) {
      case 'paper_uploaded':
        return `Uploaded research paper: "${item.metadata.title || item.metadata.fileName || 'Paper'}"`;
      case 'paper_viewed':
        return `Viewed paper details: "${item.metadata.title || 'Paper'}"`;
      case 'podcast_generated':
        return `Generated podcast episode: "${item.metadata.title || 'Episode'}"`;
      case 'podcast_played':
        return `Played podcast: "${item.metadata.title || 'Episode'}"`;
      case 'podcast_downloaded':
        return `Downloaded episode: "${item.metadata.title || 'Audio file'}"`;
      case 'search_performed':
        return `Searched for: "${item.metadata.query || 'query'}"`;
      case 'rating_submitted':
        return `Submitted ${item.metadata.overallScore || '5'}-star podcast rating`;
      case 'paper_deleted':
        return `Deleted paper: "${item.metadata.title || 'Paper'}"`;
      case 'podcast_deleted':
        return `Deleted podcast: "${item.metadata.title || 'Episode'}"`;
      default:
        return 'System event';
    }
  };

  const filteredHistory = historyItems.filter((item) => {
    if (!searchFilter) return true;
    const text = getActionLabel(item).toLowerCase();
    return text.includes(searchFilter.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Activity History
              </h3>
              <p className="text-xs text-slate-500">
                Track uploads, listens, searches, and downloads
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {historyItems.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center space-x-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Input */}
        <div className="mt-4">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter history log..."
            className="w-full rounded-xl bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* History List */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2">
          {loading ? (
            <p className="py-8 text-center text-xs text-slate-400">Loading history...</p>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <History className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs font-medium">No activity recorded yet.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-2xs">
                    {getActionIcon(item.actionType)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {getActionLabel(item)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {item.paperId && onSelectPaper && (
                  <button
                    onClick={() => {
                      onSelectPaper(item.paperId!);
                      onClose();
                    }}
                    className="shrink-0 text-[11px] font-semibold text-indigo-600 hover:underline ml-2"
                  >
                    View
                  </button>
                )}
                {item.podcastId && onSelectPodcast && (
                  <button
                    onClick={() => {
                      onSelectPodcast(item.podcastId!);
                      onClose();
                    }}
                    className="shrink-0 text-[11px] font-semibold text-violet-600 hover:underline ml-2"
                  >
                    Listen
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
