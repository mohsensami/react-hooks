import { useCallback, useEffect, useState } from 'react';

export interface SpeakOptions {
  lang?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

/**
 * Text-to-speech with the Web Speech API.
 *
 * @example
 * const { speak, cancel, speaking, voices } = useSpeechSynthesis();
 * speak('Hello world', { lang: 'en-US' });
 */
export function useSpeechSynthesis() {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string, { voice, ...options }: SpeakOptions = {}) => {
      if (!isSupported) return;
      const u = new SpeechSynthesisUtterance(text);
      Object.assign(u, options);
      if (voice) u.voice = voice;
      u.onstart = () => setSpeaking(true);
      u.onend = u.onerror = () => {
        setSpeaking(false);
        setPaused(false);
      };
      window.speechSynthesis.speak(u);
    },
    [isSupported],
  );

  const cancel = useCallback(() => isSupported && window.speechSynthesis.cancel(), [isSupported]);
  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setPaused(true);
  }, [isSupported]);
  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setPaused(false);
  }, [isSupported]);

  return { speak, cancel, pause, resume, speaking, paused, voices, isSupported };
}
