import { useEffect } from 'react';
import { useLatest } from './useLatest';

export interface AnimationFrameInfo {
  /** `DOMHighResTimeStamp` of the frame */
  time: number;
  /** Milliseconds since the previous frame */
  delta: number;
}

/**
 * Run a callback on every animation frame (`requestAnimationFrame` loop).
 * Pass `running = false` to pause.
 *
 * @example
 * useAnimationFrame(({ delta }) => {
 *   angleRef.current += delta * 0.1;
 *   el.style.transform = `rotate(${angleRef.current}deg)`;
 * });
 */
export function useAnimationFrame(
  callback: (info: AnimationFrameInfo) => void,
  running = true,
): void {
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (!running) return;

    let id = 0;
    let last = performance.now();

    const loop = (now: number) => {
      callbackRef.current({ time: now, delta: now - last });
      last = now;
      id = requestAnimationFrame(loop);
    };

    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [running, callbackRef]);
}
