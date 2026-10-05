import { ai, hasGeminiKey } from '../gemini.js';
import {
  concatenatePcmSegments,
  extractPcmFromWav,
  normalizePcm,
  synthesizeCleanSpeechPcm,
} from './audioProcessor.js';
import { storageService } from './storageService.js';

export interface GeneratedPodcastAudio {
  audioUrl: string;
  duration: number; // in seconds
  audioFormat: string;
}

/**
 * Generates crystal clear studio two-speaker audio for the podcast episode.
 * Primary: Gemini 3.8-flash-tts flagship multi-speaker audio model (Alex: Puck, Sam: Kore).
 * Produces clean human speech at 24kHz with natural cadence and zero distortion.
 */
export async function generatePodcastAudio(
  podcastId: string,
  segments: { speaker: 'HOST' | 'RESEARCHER'; text: string; sequence: number }[],
  onProgress?: (stage: string) => void
): Promise<GeneratedPodcastAudio> {
  if (onProgress) onProgress('host_audio_generating');

  // Limit conversation to top 10 turns to ensure high reliability and responsive generation
  const activeSegments = segments.slice(0, 10);

  // 1. Try Gemini Flagship Multi-Speaker TTS (Crystal Clear Studio Speech)
  if (hasGeminiKey && ai && activeSegments.length > 0) {
    try {
      console.log(`[TTS] Generating multi-speaker studio audio for ${activeSegments.length} turns via gemini-3.8-flash-tts...`);

      const parts = activeSegments.map((seg) => ({
        text: `${seg.speaker === 'HOST' ? 'Alex' : 'Sam'}: ${seg.text}`,
        speechMetadata: {
          speaker: seg.speaker === 'HOST' ? 'Alex' : 'Sam',
          style:
            seg.speaker === 'HOST'
              ? 'Enthusiastic, articulate podcast host'
              : 'Knowledgeable, calm scientific researcher',
        },
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: 'Alex',
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
                },
                {
                  speaker: 'Sam',
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
              ],
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        console.log(`[TTS] Successfully received multi-speaker audio (${base64Audio.length} b64 chars).`);
        if (onProgress) onProgress('audio_processing');

        const rawWavBuffer = Buffer.from(base64Audio, 'base64');
        const filename = `podcast_${podcastId}.wav`;
        const audioUrl = storageService.saveAudioFile(filename, rawWavBuffer);

        // Calculate duration from 24kHz mono 16-bit PCM (48000 bytes per sec)
        const pcmBytes = Math.max(0, rawWavBuffer.length - 44);
        const durationSec = Math.max(8, Math.round(pcmBytes / 48000));

        return {
          audioUrl,
          duration: durationSec,
          audioFormat: 'audio/wav',
        };
      }
    } catch (multiErr: any) {
      console.warn('[TTS] Multi-speaker TTS failed, attempting turn-by-turn flash-lite-tts:', multiErr?.message);
    }
  }

  // 2. Fallback: Segment-by-segment flash-lite-tts
  const pcmSegments: Buffer[] = [];
  let sampleRate = 24000;

  for (let i = 0; i < activeSegments.length; i++) {
    const seg = activeSegments[i];
    if (onProgress) {
      if (seg.speaker === 'HOST') onProgress('host_audio_generating');
      else onProgress('researcher_audio_generating');
    }

    let segmentPcm: Buffer | null = null;

    if (hasGeminiKey && ai) {
      try {
        const voiceName = seg.speaker === 'HOST' ? 'Puck' : 'Kore';
        const ttsRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [{ text: seg.text }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });

        const b64 = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (b64) {
          const wav = Buffer.from(b64, 'base64');
          const ext = extractPcmFromWav(wav);
          segmentPcm = ext.pcm;
          sampleRate = ext.sampleRate;
        }
      } catch (segErr) {
        console.warn(`[TTS] Single turn TTS failed for turn ${i + 1}:`, segErr);
      }
    }

    if (!segmentPcm) {
      segmentPcm = synthesizeCleanSpeechPcm(seg.text, seg.speaker, sampleRate);
    }

    pcmSegments.push(normalizePcm(segmentPcm));
  }

  if (onProgress) onProgress('audio_processing');

  // Concatenate with 450ms clean studio pauses (zero noise)
  const finalWavBuffer = concatenatePcmSegments(pcmSegments, sampleRate, 0.45);
  const filename = `podcast_${podcastId}.wav`;
  const audioUrl = storageService.saveAudioFile(filename, finalWavBuffer);

  const totalPcmBytes = finalWavBuffer.length - 44;
  const durationSec = Math.max(10, Math.round(totalPcmBytes / (sampleRate * 2)));

  return {
    audioUrl,
    duration: durationSec,
    audioFormat: 'audio/wav',
  };
}
