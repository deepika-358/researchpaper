import React from 'react';
import {
  FileText,
  Layers,
  MessageSquareCode,
  Users,
  VolumeX,
  BookOpen,
  Headphones,
  Search,
  Download,
  Trash2,
  ShieldCheck,
  Star,
} from 'lucide-react';

export const Features: React.FC = () => {
  const featureList = [
    {
      num: '01',
      title: 'Smart PDF Processing',
      description:
        'Robust parsing that handles academic PDF formats, figures, columns, and author affiliations seamlessly.',
      icon: FileText,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      num: '02',
      title: 'Section-Based Summarization',
      description:
        'Identifies Abstract, Introduction, Methodology, Results, Discussion, and Conclusion without inventing absent data.',
      icon: Layers,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
    },
    {
      num: '03',
      title: 'AI Podcast Script',
      description:
        'Synthesizes natural, engaging dialogue between Host and Researcher exploring motivation, methods, and implications.',
      icon: MessageSquareCode,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    },
    {
      num: '04',
      title: 'Two-Voice Narration',
      description:
        'Clearly distinct vocal profiles—an energetic, curious Host and a knowledgeable, measured Researcher.',
      icon: Users,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      num: '05',
      title: 'Clean Studio Audio',
      description:
        'Pure speech with calibrated inter-turn pauses. Absolutely zero background noise, music, hiss, hum, or distortion.',
      icon: VolumeX,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      num: '06',
      title: 'Research Library',
      description:
        'Dedicated storage for all analyzed papers with full section transcripts, author metadata, and quick access.',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      num: '07',
      title: 'Podcast Library',
      description:
        'Browse and listen to your entire collection of generated research episodes with instant playback and duration metrics.',
      icon: Headphones,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      num: '08',
      title: 'Global Search',
      description:
        'Fast server-side querying across paper titles, podcast scripts, authors, keywords, and publication dates.',
      icon: Search,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      num: '09',
      title: 'Download Podcast',
      description:
        'One-click download of your episodes directly as clean MP3/WAV files named PaperCast_AI_[Title].wav.',
      icon: Download,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      num: '10',
      title: 'Delete Podcast',
      description:
        'Safe deletion of episodes with full confirmation modals, cascading cleanup of audio files and database records.',
      icon: Trash2,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      num: '11',
      title: 'AI Factual Evaluation',
      description:
        'Automated scientific audit scoring factual accuracy, clarity, and verifying claims directly against original text.',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      num: '12',
      title: 'Podcast Ratings',
      description:
        'Collect detailed feedback across clarity, accuracy, and usefulness to benchmark episode effectiveness.',
      icon: Star,
      color: 'text-amber-500 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <section id="features" className="bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-violet-200 bg-violet-50/80 px-3.5 py-1 text-xs font-bold text-violet-700">
            <span>Enterprise Academic Grade</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Everything You Need for Audio Research
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Purpose-built tools designed for researchers, students, and lifelong
            learners to absorb dense scientific literature on the go.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featureList.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${feature.color} transition-transform group-hover:scale-105`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {feature.num}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-semibold text-indigo-600 group-hover:underline">
                    Learn more →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
