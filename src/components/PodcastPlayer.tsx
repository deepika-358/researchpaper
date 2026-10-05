import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Headphones,
  Maximize2,
  Mic2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Podcast, ResearchPaper } from '../types';

interface PodcastPlayerProps {
  podcast: Podcast;
  paper?: ResearchPaper;
  onDownload: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onExpandDetails?: () => void;
}

export const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  podcast,
  paper,
  onDownload,
  onDelete,
  onExpandDetails,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(podcast.duration || 0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  const [audioMode, setAudioMode] = useState<'studio' | 'live_speech'>('studio');
  const [activeSpeechTurn, setActiveSpeechTurn] = useState<string | null>(null);

  // Parse lines for script turns if live speech is active
  const scriptLines = podcast.script
    ? podcast.script
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
    : [];

  // Reset & load audio whenever podcast changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(podcast.duration || 0);
  }, [podcast.id, podcast.audioUrl]);

  // Initialize randomized waveform heights representing speech energy
  useEffect(() => {
    const bars = Array.from({ length: 48 }, () => Math.floor(Math.random() * 60) + 15);
    setWaveformBars(bars);
  }, [podcast.id]);

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
    audio.playbackRate = playbackRate;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [volume, isMuted, playbackRate]);

  // Waveform animation while playing
  useEffect(() => {
    let animInterval: any;
    if (isPlaying) {
      animInterval = setInterval(() => {
        setWaveformBars((prev) =>
          prev.map(() => Math.floor(Math.random() * 70) + 20)
        );
      }, 150);
    }
    return () => clearInterval(animInterval);
  }, [isPlaying]);

  // Stop speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Web Speech API Live Narration (Dual Voice)
  const playLiveSpeechNarration = (startIndex = 0) => {
    if (!('speechSynthesis' in window)) {
      setAudioMode('studio');
      toggleStudioAudio();
      return;
    }

    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
    const hostVoice = englishVoices.find((v) => /male|daniel|david|alex|aaron/i.test(v.name)) || englishVoices[0] || voices[0];
    const researcherVoice = englishVoices.find((v) => /female|samantha|karen|victoria|zira|susan/i.test(v.name)) || englishVoices[1] || voices[1] || hostVoice;

    let lineIndex = startIndex;

    const speakNextTurn = () => {
      if (lineIndex >= scriptLines.length) {
        setIsPlaying(false);
        setActiveSpeechTurn(null);
        return;
      }

      const line = scriptLines[lineIndex];
      const isHost = line.startsWith('HOST:') || line.startsWith('Alex:');
      const textToSpeak = line.replace(/^(HOST|Alex|RESEARCHER|Sam):\s*/i, '');
      setActiveSpeechTurn(line);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = playbackRate;
      utterance.pitch = isHost ? 0.95 : 1.15;
      utterance.voice = isHost ? hostVoice : researcherVoice;

      utterance.onend = () => {
        lineIndex++;
        // Small 350ms studio pause between turns
        setTimeout(speakNextTurn, 350);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setActiveSpeechTurn(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextTurn();
    setIsPlaying(true);
  };

  const toggleStudioAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Direct audio play notice, switching to Live Voice mode:', err);
          setAudioMode('live_speech');
          playLiveSpeechNarration();
        });
    }
  };

  const togglePlay = () => {
    if (audioMode === 'live_speech') {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setActiveSpeechTurn(null);
      } else {
        playLiveSpeechNarration();
      }
    } else {
      toggleStudioAudio();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current && audioMode === 'studio') {
      audioRef.current.currentTime = time;
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioMode === 'studio' && audioRef.current) {
      const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const cyclePlaybackRate = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const formatTime = (secs: number): string => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-2xl">
      <audio
        ref={audioRef}
        src={podcast.audioUrl}
        preload="auto"
      />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Clean Studio Audio
            </span>
            <span className="rounded bg-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
              {audioMode === 'studio' ? '24 kHz WAV' : 'Neural Speech Engine'}
            </span>
          </div>

          <h3 className="mt-1 truncate text-lg sm:text-xl font-extrabold text-white">
            {podcast.title}
          </h3>

          <p className="mt-0.5 truncate text-xs text-slate-400">
            Paper: {paper ? paper.title : 'Academic Research Paper'}
          </p>
        </div>

        {/* Action Buttons: Mode Toggle, Expand, Download, Delete */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Audio Engine Mode Switch */}
          <div className="flex items-center rounded-xl bg-slate-800/90 p-1 border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => {
                if (audioMode !== 'studio') {
                  window.speechSynthesis.cancel();
                  setIsPlaying(false);
                  setAudioMode('studio');
                }
              }}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition-colors ${
                audioMode === 'studio'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Studio WAV
            </button>
            <button
              onClick={() => {
                if (audioMode !== 'live_speech') {
                  if (audioRef.current) audioRef.current.pause();
                  setIsPlaying(false);
                  setAudioMode('live_speech');
                }
              }}
              className={`rounded-lg px-2.5 py-1 text-[11px] transition-colors flex items-center space-x-1 ${
                audioMode === 'live_speech'
                  ? 'bg-violet-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Live Voice</span>
            </button>
          </div>

          {onExpandDetails && (
            <button
              onClick={onExpandDetails}
              className="flex items-center space-x-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              title="View full script and analysis"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Details</span>
            </button>
          )}

          <button
            onClick={() => onDownload(podcast.id, paper?.title || podcast.title)}
            className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95"
            title="Download Podcast (WAV/MP3)"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={() => onDelete(podcast.id)}
            className="rounded-xl border border-rose-900/40 bg-rose-950/40 p-2 text-rose-400 hover:bg-rose-900/60 hover:text-rose-200 transition-colors"
            title="Delete Podcast"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Speaker Badges */}
      <div className="mt-5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 rounded-lg bg-indigo-500/20 px-2.5 py-1 text-indigo-300 ring-1 ring-indigo-500/30">
            <Mic2 className="h-3 w-3 text-indigo-400" />
            <span className="font-semibold">Host: Alex (Puck)</span>
          </div>

          <div className="flex items-center space-x-1.5 rounded-lg bg-violet-500/20 px-2.5 py-1 text-violet-300 ring-1 ring-violet-500/30">
            <Headphones className="h-3 w-3 text-violet-400" />
            <span className="font-semibold">Researcher: Dr. Sam (Kore)</span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-cyan-400">
          {audioMode === 'studio' ? 'Gemini 24kHz Studio Speech' : 'Neural Speech High-Def'}
        </span>
      </div>

      {/* Live speech turn banner if active */}
      {audioMode === 'live_speech' && activeSpeechTurn && (
        <div className="mt-4 rounded-xl border border-violet-500/40 bg-violet-950/60 p-3 text-xs text-violet-200 animate-in fade-in">
          <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] block mb-1">
            Now Speaking:
          </span>
          <p className="italic font-medium">{activeSpeechTurn}</p>
        </div>
      )}

      {/* Animated Waveform Display */}
      <div className="mt-5 flex h-14 items-end justify-between gap-0.5 rounded-2xl bg-slate-950/80 px-4 py-2 border border-slate-800">
        {waveformBars.map((height, i) => {
          const barProgress = (i / waveformBars.length) * 100;
          const isPassed = barProgress <= progressPercent;

          return (
            <div
              key={i}
              style={{ height: `${height}%` }}
              className={`w-1 rounded-full transition-all duration-200 ${
                isPassed || isPlaying
                  ? 'bg-gradient-to-t from-cyan-400 to-indigo-400'
                  : 'bg-slate-700/60'
              }`}
            />
          );
        })}
      </div>

      {/* Scrubber Timeline (for Studio mode) */}
      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          disabled={audioMode === 'live_speech'}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-colors disabled:opacity-50"
        />
        <div className="flex justify-between text-xs font-mono text-slate-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Playback Controls Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        {/* Playback Speed selector */}
        <button
          onClick={cyclePlaybackRate}
          className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
          title="Change playback speed"
        >
          {playbackRate}x
        </button>

        {/* Center Playback Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSkip(-10)}
            disabled={audioMode === 'live_speech'}
            className="rounded-full p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-30"
            title="Skip back 10 seconds"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={togglePlay}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-transform"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 fill-current" />
            ) : (
              <Play className="h-6 w-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => handleSkip(10)}
            disabled={audioMode === 'live_speech'}
            className="rounded-full p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-30"
            title="Skip forward 10 seconds"
          >
            <RotateCw className="h-5 w-5" />
          </button>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5 text-rose-400" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              setIsMuted(false);
              if (audioRef.current) {
                audioRef.current.volume = v;
                audioRef.current.muted = false;
              }
            }}
            className="w-16 sm:w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
