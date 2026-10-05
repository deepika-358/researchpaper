import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Headphones,
  Mic2,
  Play,
  Radio,
  ShieldCheck,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';

interface HeroProps {
  onOpenUpload: () => void;
  onExploreHowItWorks: () => void;
  onQuickPlaySeed: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenUpload,
  onExploreHowItWorks,
  onQuickPlaySeed,
}) => {
  // Waveform bars animation
  const [waveHeights, setWaveHeights] = useState<number[]>([
    24, 45, 68, 90, 72, 38, 54, 82, 60, 40, 75, 95, 80, 50, 65, 88, 42, 60,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 65) + 25)
      );
    }, 280);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Background Subtle Gradient Blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-6 text-center lg:text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs backdrop-blur-xs">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
              <span>Research Papers. Simplified. Spoken.</span>
            </div>

            {/* Main Heading */}
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your Research Paper.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
                Now in Conversation.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-5 text-lg text-slate-600 sm:text-xl sm:leading-relaxed">
              PaperCast AI transforms complex academic research into clear,
              engaging AI-powered podcasts with two distinct voices, zero noise,
              and strict factual grounding.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 lg:justify-start">
              <button
                onClick={onOpenUpload}
                className="group relative flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl hover:shadow-indigo-500/35 active:scale-98 sm:w-auto"
              >
                <Mic2 className="h-5 w-5" />
                <span>Create Your Podcast</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onExploreHowItWorks}
                className="flex w-full items-center justify-center space-x-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
              >
                <span>How It Works</span>
              </button>
            </div>

            {/* Value Highlights */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-200/80 pt-6 text-left">
              <div>
                <p className="text-2xl font-black text-slate-900">2-Voice</p>
                <p className="text-xs font-medium text-slate-500">
                  Host & Researcher dialogue
                </p>
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-600">100%</p>
                <p className="text-xs font-medium text-slate-500">
                  Clean studio audio
                </p>
              </div>
              <div>
                <p className="text-2xl font-black text-violet-600">0 Hallucination</p>
                <p className="text-xs font-medium text-slate-500">
                  Factual verification audit
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: AI-Themed Interactive Visual Transformation Animation */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Outer Card with Glassmorphism and Glow */}
              <div className="relative rounded-3xl border border-indigo-100 bg-gradient-to-br from-white/90 via-white/80 to-slate-50/90 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
                {/* Visual Pipeline Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Transformation Engine
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                    <Sparkles className="h-3 w-3" />
                    <span>Neural Pipeline</span>
                  </div>
                </div>

                {/* Animated Transformation Flow */}
                <div className="relative mt-6 space-y-4">
                  {/* Step 1: Uploaded Research Paper */}
                  <div className="relative flex items-center space-x-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-transform hover:scale-[1.01]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 ring-1 ring-red-100">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-600">01 • INPUT PDF</span>
                        <span className="text-[11px] font-medium text-slate-400">2.2 MB</span>
                      </div>
                      <p className="truncate text-sm font-bold text-slate-900">
                        Attention Is All You Need.pdf
                      </p>
                      <p className="text-xs text-slate-500">
                        Vaswani et al. • Neural Information Processing Systems
                      </p>
                    </div>
                  </div>

                  {/* Connecting AI Flow Line */}
                  <div className="relative flex items-center justify-center py-0.5">
                    <div className="h-6 w-0.5 bg-gradient-to-b from-red-200 via-indigo-400 to-violet-400" />
                    <span className="absolute rounded-full bg-indigo-100 p-1 text-indigo-600">
                      <Zap className="h-3 w-3 animate-pulse" />
                    </span>
                  </div>

                  {/* Step 2: AI Section Analysis & Dialogue Generation */}
                  <div className="relative rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 to-violet-50/50 p-4 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                      <span>02 • AI CONVERSATION ENGINE</span>
                      <span className="flex items-center space-x-1 text-emerald-600">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Factual Match: 98%</span>
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      {/* Host Turn Snippet */}
                      <div className="flex items-start space-x-2 rounded-lg bg-white/90 p-2.5 shadow-2xs">
                        <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          HOST
                        </span>
                        <p className="text-slate-700 italic">
                          "What exact challenge were the researchers trying to solve?"
                        </p>
                      </div>

                      {/* Researcher Turn Snippet */}
                      <div className="flex items-start space-x-2 rounded-lg bg-white/90 p-2.5 shadow-2xs">
                        <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          RESEARCHER
                        </span>
                        <p className="text-slate-700 italic">
                          "Sequential RNNs blocked parallelization. The Transformer solved this with self-attention."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Connecting Audio Flow Line */}
                  <div className="relative flex items-center justify-center py-0.5">
                    <div className="h-6 w-0.5 bg-gradient-to-b from-indigo-400 via-violet-400 to-cyan-500" />
                    <span className="absolute rounded-full bg-violet-100 p-1 text-violet-600">
                      <Radio className="h-3 w-3 animate-pulse" />
                    </span>
                  </div>

                  {/* Step 3: Final Studio Podcast & Real-time Waveform */}
                  <div className="rounded-2xl border border-slate-900 bg-slate-900 p-4 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/30 text-indigo-400">
                          <Headphones className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-indigo-400">
                            03 • CLEAN STUDIO PODCAST
                          </p>
                          <p className="text-sm font-bold text-white">
                            Episode 1: Why Attention Conquered AI
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={onQuickPlaySeed}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
                        title="Listen to sample episode"
                      >
                        <Play className="h-4 w-4 ml-0.5 fill-current" />
                      </button>
                    </div>

                    {/* Animated Waveform Visualizer */}
                    <div className="mt-4 flex h-10 items-end justify-between gap-1 rounded-xl bg-slate-950/60 px-3 py-2">
                      {waveHeights.map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            i % 2 === 0
                              ? 'bg-gradient-to-t from-indigo-500 to-cyan-400'
                              : 'bg-gradient-to-t from-violet-500 to-indigo-400'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Alex (Host) & Dr. Sam (Researcher)</span>
                      <span className="font-mono text-cyan-400">01:52 • No noise</span>
                    </div>
                  </div>
                </div>

                {/* Floating Insight Pill 1 */}
                <div className="absolute -top-3 -left-4 hidden sm:flex items-center space-x-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-800">
                    Dual Voice Synthesizer
                  </span>
                </div>

                {/* Floating Insight Pill 2 */}
                <div className="absolute -bottom-3 -right-3 hidden sm:flex items-center space-x-2 rounded-xl border border-indigo-100 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md">
                  <Volume2 className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Zero Background Noise
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
