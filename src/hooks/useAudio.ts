import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Control an `Audio` element: play/pause, seek, volume, progress.
 *
 * @example
 * const audio = useAudio('/song.mp3');
 * <button onClick={audio.toggle}>{audio.playing ? 'Pause' : 'Play'}</button>
 */
export function useAudio(src: string, { loop = false }: { loop?: boolean } = {}) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMutedState] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const a = new Audio(src);
    a.loop = loop;
    ref.current = a;
    const handlers: Record<string, () => void> = {
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      ended: () => setEnded(true),
      timeupdate: () => setCurrentTime(a.currentTime),
      loadedmetadata: () => setDuration(a.duration),
    };
    Object.entries(handlers).forEach(([e, h]) => a.addEventListener(e, h));
    return () => {
      Object.entries(handlers).forEach(([e, h]) => a.removeEventListener(e, h));
      a.pause();
      ref.current = null;
      setPlaying(false);
      setCurrentTime(0);
    };
  }, [src, loop]);

  const play = useCallback(async () => {
    setEnded(false);
    await ref.current?.play();
  }, []);
  const pause = useCallback(() => ref.current?.pause(), []);
  const toggle = useCallback(() => (ref.current?.paused ? play() : pause()), [play, pause]);
  const seek = useCallback((time: number) => {
    if (ref.current) ref.current.currentTime = time;
  }, []);
  const setVolume = useCallback((v: number) => {
    if (ref.current) ref.current.volume = v;
    setVolumeState(v);
  }, []);
  const setMuted = useCallback((m: boolean) => {
    if (ref.current) ref.current.muted = m;
    setMutedState(m);
  }, []);

  return { play, pause, toggle, seek, playing, currentTime, duration, volume, setVolume, muted, setMuted, ended };
}
