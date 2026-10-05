import React from 'react';
import { Headphones, Heart, Mic2, Radio, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenUpload: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenUpload }) => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                <Radio className="h-4 w-4" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                PaperCast <span className="text-indigo-600">AI</span>
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              "Research Papers. Simplified. Spoken."
            </p>
            <p className="max-w-md text-xs leading-relaxed text-slate-500">
              Transforming complex academic literature into clear, engaging,
              studio-quality two-speaker podcasts. Clean audio, zero noise, and
              verified factual accuracy.
            </p>
          </div>

          {/* Quick Navigation (No Auth) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Navigation
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-indigo-600 transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('features')}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('library')}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Research Library
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('podcasts')}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Podcast Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Analytics Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Audio Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Studio Standards
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Zero Background Noise</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span>Two-Speaker Dialogue</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                <span>24 kHz Studio Normalization</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                <span>AI Factual Verification</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenUpload}
                  className="inline-flex items-center space-x-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  <Mic2 className="h-3 w-3" />
                  <span>Start a Podcast Now</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} PaperCast AI. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Built for academic excellence</span>
            <span>•</span>
            <span>No authentication required</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
