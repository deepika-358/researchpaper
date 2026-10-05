import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  type: 'podcast' | 'paper';
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  type,
  title,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  const isPaper = type === 'paper';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Warning Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
          <AlertTriangle className="h-6 w-6" />
        </div>

        {/* Modal Text */}
        <h3 className="mt-4 text-lg font-bold text-slate-900">
          {isPaper ? 'Delete Research Paper?' : 'Delete Podcast?'}
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          {isPaper
            ? 'Deleting this research paper may also delete its generated podcast, audio files, and analysis. Continue?'
            : 'Are you sure you want to delete this podcast? This will permanently remove the audio file and its transcript.'}
        </p>

        <p className="mt-3 truncate rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 border border-slate-200">
          "{title}"
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center space-x-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
