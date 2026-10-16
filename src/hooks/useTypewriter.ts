import { useCallback, useEffect, useState } from 'react';

export interface UseTypewriterOptions {
  /** ms per character (default 50) */
  speed?: number;
  /** ms before typing starts (default 0) */
  delay?: number;
}

/**
 * Typewriter effect: reveals `text` one character at a time.
 *
 * @example
 * const { displayed, isTyping, restart } = useTypewriter('Hello world', { speed: 80 });
 */
export function useTypewriter(text: string, { speed = 50, delay = 0 }: UseTypewriterOptions = {}) {
  const [length, setLength] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    setLength(0);
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        setLength((l) => {
          if (l >= text.length) {
            clearInterval(interval);
            return l;
          }
          return l + 1;
        });
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [text, speed, delay, run]);

  const restart = useCallback(() => setRun((r) => r + 1), []);
  return { displayed: text.slice(0, length), isTyping: length < text.length, restart };
}
