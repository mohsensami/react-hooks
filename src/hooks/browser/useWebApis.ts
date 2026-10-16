import { useCallback, useEffect, useRef, useState } from 'react'

/* ---------------- Notifications ---------------- */

/**
 * Web Notifications API.
 * @example const { permission, request, notify } = useNotification(); notify('Hi', { body: 'Hello!' })
 */
export function useNotification() {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(isSupported ? Notification.permission : 'unsupported')
  const request = useCallback(async () => {
    if (!isSupported) return 'unsupported' as const
    const p = await Notification.requestPermission()
    setPermission(p)
    return p
  }, [isSupported])
  const notify = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || Notification.permission !== 'granted') return null
      return new Notification(title, options)
    },
    [isSupported],
  )
  return { isSupported, permission, request, notify }
}

/* ---------------- Share ---------------- */

/** Native share sheet. @example const { share, canShare } = useShare(); share({ title, url }) */
export function useShare() {
  const isSupported = typeof navigator !== 'undefined' && !!navigator.share
  const share = useCallback(async (data: ShareData) => {
    if (!navigator.share) return false
    try {
      await navigator.share(data)
      return true
    } catch {
      return false // user cancelled
    }
  }, [])
  return { isSupported, share }
}

/* ---------------- Vibrate ---------------- */

/** Vibration API. @example const { vibrate } = useVibrate(); vibrate([100, 50, 100]) */
export function useVibrate() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator
  const vibrate = useCallback((pattern: number | number[] = 200) => isSupported && navigator.vibrate(pattern), [isSupported])
  const stop = useCallback(() => isSupported && navigator.vibrate(0), [isSupported])
  return { isSupported, vibrate, stop }
}

/* ---------------- Permissions ---------------- */

export type PermissionStateEx = PermissionState | 'unsupported' | 'unknown'

/**
 * Query a browser permission and follow changes.
 * @example const state = usePermission('geolocation') // 'granted' | 'denied' | 'prompt'
 */
export function usePermission(name: string): PermissionStateEx {
  const [state, setState] = useState<PermissionStateEx>('unknown')
  useEffect(() => {
    if (!navigator.permissions) return setState('unsupported')
    let status: PermissionStatus | undefined
    let alive = true
    const onChange = () => status && setState(status.state)
    navigator.permissions
      .query({ name: name as PermissionName })
      .then((s) => {
        if (!alive) return
        status = s
        setState(s.state)
        s.addEventListener('change', onChange)
      })
      .catch(() => alive && setState('unsupported'))
    return () => {
      alive = false
      status?.removeEventListener('change', onChange)
    }
  }, [name])
  return state
}

/* ---------------- Wake lock ---------------- */

interface WakeLockSentinelLike extends EventTarget { release(): Promise<void> }

/**
 * Keep the screen awake.
 * @example const { request, release, active } = useWakeLock()
 */
export function useWakeLock() {
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const sentinel = useRef<WakeLockSentinelLike | null>(null)
  const [active, setActive] = useState(false)

  const request = useCallback(async () => {
    if (!isSupported) return false
    try {
      const s = await (navigator as Navigator & { wakeLock: { request: (t: 'screen') => Promise<WakeLockSentinelLike> } }).wakeLock.request('screen')
      sentinel.current = s
      s.addEventListener('release', () => setActive(false))
      setActive(true)
      return true
    } catch {
      return false
    }
  }, [isSupported])
  const release = useCallback(async () => {
    await sentinel.current?.release()
    sentinel.current = null
    setActive(false)
  }, [])
  useEffect(() => () => void sentinel.current?.release(), [])
  return { isSupported, active, request, release }
}

/* ---------------- EyeDropper ---------------- */

/** Pick a color from the screen (Chromium). @example const { open } = useEyeDropper(); const hex = await open() */
export function useEyeDropper() {
  const Ctor = typeof window !== 'undefined' ? (window as unknown as { EyeDropper?: new () => { open: (o?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }> } }).EyeDropper : undefined
  const open = useCallback(async () => {
    if (!Ctor) return null
    try {
      return (await new Ctor().open()).sRGBHex
    } catch {
      return null
    }
  }, [Ctor])
  return { isSupported: !!Ctor, open }
}

/* ---------------- Text selection ---------------- */

/** Currently selected text on the page. @example const { text, rect } = useTextSelection() */
export function useTextSelection() {
  const [state, setState] = useState<{ text: string; rect: DOMRect | null }>({ text: '', rect: null })
  useEffect(() => {
    const handler = () => {
      const sel = document.getSelection()
      const text = sel?.toString() ?? ''
      setState({ text, rect: text && sel && sel.rangeCount ? sel.getRangeAt(0).getBoundingClientRect() : null })
    }
    document.addEventListener('selectionchange', handler)
    return () => document.removeEventListener('selectionchange', handler)
  }, [])
  return state
}

/* ---------------- Camera / microphone ---------------- */

/**
 * getUserMedia – camera and / or microphone stream.
 * @example const { stream, start, stop } = useUserMedia({ video: true }); videoRef.current.srcObject = stream
 */
export function useUserMedia(constraints: MediaStreamConstraints = { video: true, audio: false }) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const constraintsRef = useRef(constraints)
  constraintsRef.current = constraints

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setStream(null)
  }, [])
  const start = useCallback(async () => {
    stop()
    setLoading(true)
    setError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia(constraintsRef.current)
      streamRef.current = s
      setStream(s)
      return s
    } catch (e) {
      setError(e as Error)
      return null
    } finally {
      setLoading(false)
    }
  }, [stop])
  useEffect(() => stop, [stop])
  return { stream, error, loading, isActive: !!stream, start, stop }
}

/** List of cameras / microphones / speakers (kept up to date). */
export function useMediaDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  useEffect(() => {
    if (!navigator.mediaDevices) return
    const update = () => navigator.mediaDevices.enumerateDevices().then(setDevices).catch(() => {})
    update()
    navigator.mediaDevices.addEventListener('devicechange', update)
    return () => navigator.mediaDevices.removeEventListener('devicechange', update)
  }, [])
  return {
    devices,
    cameras: devices.filter((d) => d.kind === 'videoinput'),
    microphones: devices.filter((d) => d.kind === 'audioinput'),
    speakers: devices.filter((d) => d.kind === 'audiooutput'),
  }
}
