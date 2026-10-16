import { useCallback, useEffect, useState } from 'react'

/**
 * Device orientation (gyroscope) – alpha/beta/gamma in degrees.
 * iOS needs `requestPermission()` called from a click.
 * @example const { beta, gamma, requestPermission } = useDeviceOrientation()
 */
export function useDeviceOrientation() {
  const [state, setState] = useState({ alpha: null as number | null, beta: null as number | null, gamma: null as number | null, absolute: false })
  const [permission, setPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => setState({ alpha: e.alpha, beta: e.beta, gamma: e.gamma, absolute: e.absolute })
    window.addEventListener('deviceorientation', handler)
    return () => window.removeEventListener('deviceorientation', handler)
  }, [])

  const requestPermission = useCallback(async () => {
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> }
    const result = D.requestPermission ? await D.requestPermission() : 'granted'
    setPermission(result)
    return result
  }, [])
  return { ...state, permission, requestPermission, isSupported: typeof window !== 'undefined' && 'DeviceOrientationEvent' in window }
}

/**
 * Accelerometer / rotation rate.
 * @example const { acceleration, rotationRate } = useDeviceMotion()
 */
export function useDeviceMotion() {
  const [state, setState] = useState<{
    acceleration: DeviceMotionEventAcceleration | null
    accelerationIncludingGravity: DeviceMotionEventAcceleration | null
    rotationRate: DeviceMotionEventRotationRate | null
    interval: number
  }>({ acceleration: null, accelerationIncludingGravity: null, rotationRate: null, interval: 0 })
  useEffect(() => {
    const handler = (e: DeviceMotionEvent) =>
      setState({ acceleration: e.acceleration, accelerationIncludingGravity: e.accelerationIncludingGravity, rotationRate: e.rotationRate, interval: e.interval })
    window.addEventListener('devicemotion', handler)
    return () => window.removeEventListener('devicemotion', handler)
  }, [])
  return state
}

/**
 * Screen orientation type & angle.
 * @example const { type, angle } = useScreenOrientation()
 */
export function useScreenOrientation() {
  const read = () => ({ type: (typeof screen !== 'undefined' && screen.orientation?.type) || 'unknown', angle: (typeof screen !== 'undefined' && screen.orientation?.angle) || 0 })
  const [state, setState] = useState(read)
  useEffect(() => {
    const handler = () => setState(read())
    screen.orientation?.addEventListener('change', handler)
    return () => screen.orientation?.removeEventListener('change', handler)
  }, [])
  return state
}
