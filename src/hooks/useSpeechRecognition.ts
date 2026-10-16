import { useCallback, useEffect, useRef, useState } from 'react';

interface RecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface RecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<RecognitionResultLike>;
}
interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionCtor = new () => RecognitionLike;

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

/**
 * Speech-to-text with the Web Speech API (`SpeechRecognition`).
 *
 * @example
 * const { transcript, listening, start, stop } = useSpeechRecognition({ lang: 'fa-IR' });
 */
export function useSpeechRecognition({
  lang = 'en-US',
  continuous = true,
  interimResults = true,
}: UseSpeechRecognitionOptions = {}) {
  const Ctor: RecognitionCtor | undefined =
    typeof window === 'undefined'
      ? undefined
      : (window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor })
          .SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition?: RecognitionCtor }).webkitSpeechRecognition;

  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<RecognitionLike | null>(null);

  useEffect(() => () => ref.current?.abort(), []);

  const start = useCallback(() => {
    if (!Ctor) return;
    ref.current?.abort();
    const r = new Ctor();
    r.lang = lang;
    r.continuous = continuous;
    r.interimResults = interimResults;
    r.onresult = (e) => {
      let finalText = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      if (finalText) setTranscript((t) => t + finalText);
      setInterim(interimText);
    };
    r.onerror = (e) => setError(e.error);
    r.onend = () => setListening(false);
    ref.current = r;
    setError(null);
    r.start();
    setListening(true);
  }, [Ctor, lang, continuous, interimResults]);

  const stop = useCallback(() => ref.current?.stop(), []);
  const reset = useCallback(() => {
    setTranscript('');
    setInterim('');
  }, []);

  return { transcript, interim, listening, error, start, stop, reset, isSupported: !!Ctor };
}
