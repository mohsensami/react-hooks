import { useCallback, useEffect, useState } from 'react'
import { resolveTarget } from '../_internal'
import type { TargetLike } from '../_internal'

/**
 * Full controls + state for an <audio> / <video> element.
 * @example
 * const ref = useRef<HTMLVideoElement>(null)
 * const m = useMediaControls(ref); <video ref={ref} src="..." /> <button onClick={m.toggle}>
 */
export function useMediaControls(target: TargetLike<HTMLMediaElement>) {
  const [state, setState] = useState({ playing: false, currentTime: 0, duration: 0, volume: 1, muted: false, playbackRate: 1, ended: false, waiting: false, buffered: 0 })

  useEffect(() => {
    const el = resolveTarget<HTMLMediaElement>(target)
    if (!el) return
    const sync = () =>
      setState({
        playing: !el.paused && !el.ended,
        currentTime: el.currentTime,
        duration: Number.isFinite(el.duration) ? el.duration : 0,
        volume: el.volume,
        muted: el.muted,
        playbackRate: el.playbackRate,
        ended: el.ended,
        waiting: el.readyState < 3 && !el.paused,
        buffered: el.buffered.length ? el.buffered.end(el.buffered.length - 1) : 0,
      })
    const events = ['play', 'pause', 'ended', 'timeupdate', 'durationchange', 'volumechange', 'ratechange', 'waiting', 'playing', 'progress', 'loadedmetadata', 'canplay']
    events.forEach((e) => el.addEventListener(e, sync))
    sync()
    return () => events.forEach((e) => el.removeEventListener(e, sync))
  }, [target])

  const el = () => resolveTarget<HTMLMediaElement>(target)
  const play = useCallback(() => el()?.play().catch(() => {}), []) // eslint-disable-line react-hooks/exhaustive-deps
  const pause = useCallback(() => el()?.pause(), []) // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = useCallback(() => { const m = el(); if (m) m.paused ? m.play().catch(() => {}) : m.pause() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const seek = useCallback((t: number) => { const m = el(); if (m) m.currentTime = t }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const setVolume = useCallback((v: number) => { const m = el(); if (m) m.volume = Math.min(1, Math.max(0, v)) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const setMuted = useCallback((v: boolean) => { const m = el(); if (m) m.muted = v }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const setRate = useCallback((r: number) => { const m = el(); if (m) m.playbackRate = r }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, play, pause, toggle, seek, setVolume, setMuted, setRate }
}

/**
 * Programmatic audio player (no <audio> in JSX).
 * @example const audio = useAudio('/sound.mp3'); audio.play()
 */
export function useAudio(src: string, { loop = false, autoPlay = false }: { loop?: boolean; autoPlay?: boolean } = {}) {
  const [el, setEl] = useState<HTMLAudioElement | null>(null)
  useEffect(() => {
    const a = new Audio(src)
    a.loop = loop
    setEl(a)
    if (autoPlay) a.play().catch(() => {})
    return () => {
      a.pause()
      a.src = ''
      setEl(null)
    }
  }, [src, loop, autoPlay])
  return useMediaControls(el)
}
