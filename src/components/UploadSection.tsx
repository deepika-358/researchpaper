import React, { useRef, useState } from 'react';
import {
  FileText,
  UploadCloud,
  X,
  Sparkles,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface UploadSectionProps {
  onStartUpload: (file: File) => void;
  isProcessing: boolean;
  onSelectSamplePaper: (sampleTitle: string, sampleData: any) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onStartUpload,
  isProcessing,
  onSelectSamplePaper,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid PDF file.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('This file exceeds the supported size limit (25 MB).');
      return;
    }

    setSelectedFile(file);
    // Simulate initial scan progress
    setUploadProgress(100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeClick = () => {
    if (!selectedFile) return;
    onStartUpload(selectedFile);
  };

  const samplePapers = [
    {
      title: 'Attention Is All You Need',
      authors: 'Vaswani et al. (Google Brain / Research)',
      size: '2.2 MB',
      description: 'The seminal foundation of Transformers and modern LLMs.',
      category: 'Deep Learning',
    },
    {
      title: 'Deep Residual Learning for Image Recognition',
      authors: 'He et al. (Microsoft Research)',
      size: '1.8 MB',
      description: 'Breakthrough deep residual learning framework (ResNet).',
      category: 'Computer Vision',
    },
    {
      title: 'Quantum Computational Supremacy Using a Programmable Processor',
      authors: 'Arute et al. (Google Quantum AI)',
      size: '3.1 MB',
      description: 'Experimental demonstration of quantum advantage on Sycamore.',
      category: 'Quantum Computing',
    },
  ];

  return (
    <section id="upload" className="relative bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Instant AI Conversion</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Turn Your Research into a Podcast
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
            Upload an academic research paper and let AI transform it into an
            engaging conversation. No login or registration required.
          </p>
        </div>

        {/* Upload Container */}
        <div className="mt-10 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 to-white p-6 shadow-xl shadow-slate-200/50 sm:p-10">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload-input"
          />

          {/* Drag & Drop Area */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50/80 scale-[1.01]'
                  : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50/50">
                <UploadCloud className="h-8 w-8 animate-bounce" />
              </div>

              <p className="mt-5 text-lg font-bold text-slate-900">
                Drag & Drop your PDF here
              </p>
              <p className="mt-1 text-sm text-slate-500">
                or{' '}
                <span className="font-semibold text-indigo-600 underline">
                  Browse Files
                </span>{' '}
                from your device
              </p>

              <div className="mt-6 flex items-center space-x-2 text-xs text-slate-400">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                  PDF format only
                </span>
                <span>•</span>
                <span>Up to 25 MB</span>
                <span>•</span>
                <span>Instant Section Extraction</span>
              </div>
            </div>
          ) : (
            /* Selected File Display */
            <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-slate-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Upload Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>File validated</span>
                  <span>100%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-300 w-full" />
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Change File
                </button>

                <button
                  onClick={handleAnalyzeClick}
                  disabled={isProcessing}
                  className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Research Paper</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 flex items-center space-x-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sample Papers Quick-Select */}
          <div className="mt-10 border-t border-slate-200/80 pt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Or test immediately with classic benchmark papers:
                </h3>
              </div>
              <span className="text-xs text-slate-500">1-Click Test</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {samplePapers.map((sample) => (
                <button
                  key={sample.title}
                  onClick={() => onSelectSamplePaper(sample.title, sample)}
                  disabled={isProcessing}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-2xs transition-all hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-md"
                >
                  <div>
                    <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {sample.category}
                    </span>
                    <p className="mt-2 text-xs font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-1">
                      {sample.title}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                      {sample.authors}
                    </p>
                  </div>
                  <span className="mt-3 text-[11px] font-semibold text-indigo-600">
                    Load & Convert →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
