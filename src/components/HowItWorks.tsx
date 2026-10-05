import React from 'react';
import {
  FileUp,
  BrainCircuit,
  MessageSquareShare,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'UPLOAD',
      description: 'Upload your academic research paper.',
      detail:
        'Drag & drop your PDF. The system accepts any academic paper, empirical study, or preprint directly with zero sign-up.',
      icon: FileUp,
      color: 'from-blue-600 to-indigo-600',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      number: '02',
      title: 'ANALYZE',
      description: 'AI extracts and understands the research.',
      detail:
        'Detects core sections—Abstract, Methodology, Results, Discussion, and Conclusion. Preserves all metrics and numerical data without hallucinations.',
      icon: BrainCircuit,
      color: 'from-indigo-600 to-violet-600',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      number: '03',
      title: 'CONVERT',
      description: 'AI converts the research into a natural conversation.',
      detail:
        'Crafts an insightful dialogue between an engaging Host and an authoritative Researcher, explaining problems, methods, and discoveries.',
      icon: MessageSquareShare,
      color: 'from-violet-600 to-purple-600',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    {
      number: '04',
      title: 'LISTEN',
      description: 'Listen to your research as a podcast.',
      detail:
        'Stream clean studio-quality audio with two distinct voices, zero background noise, animated waveform visualizer, and download MP3/WAV.',
      icon: Headphones,
      color: 'from-purple-600 to-cyan-600',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
  ];

  return (
    <section id="how-it-works" className="relative bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 bg-indigo-50/70 px-3.5 py-1 text-xs font-bold text-indigo-700">
            <span>Seamless 4-Step Pipeline</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            From dense academic prose to an engaging, two-speaker educational
            podcast in seconds.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative flex flex-col rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/10"
              >
                {/* Number & Icon */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-black text-slate-300 transition-colors group-hover:text-indigo-600">
                    {step.number}
                  </span>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${step.color} text-white shadow-md shadow-indigo-500/20`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                {/* Title */}
                <div className="mt-6">
                  <span
                    className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${step.badgeColor}`}
                  >
                    {step.title}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    "{step.description}"
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.detail}
                  </p>
                </div>

                {/* Step Connector Indicator */}
                {idx < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 lg:block z-10">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-xs">
                      →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Studio Guarantee Banner */}
        <div className="mt-14 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-cyan-50/60 p-5 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <div className="flex items-center space-x-3 justify-center sm:justify-start">
            <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0" />
            <span className="text-sm font-semibold text-slate-800">
              Clean Studio Standard: Zero background noise, zero music, calibrated
              silence pauses, and strict volume normalization.
            </span>
          </div>
          <span className="mt-2 inline-block text-xs font-bold text-indigo-600 sm:mt-0">
            Factual Verification Built-in
          </span>
        </div>
      </div>
    </section>
  );
};
