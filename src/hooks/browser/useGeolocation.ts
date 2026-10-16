import { useEffect, useState } from 'react'

export interface GeolocationState {
  loading: boolean
  error: GeolocationPositionError | Error | null
  coords: GeolocationCoordinates | null
  timestamp: number | null
}

/**
 * User location. `watch: true` keeps updating.
 * Nothing is requested until `enabled` is true (the browser shows a permission prompt).
 * @example const { coords, loading, error } = useGeolocation({ enabled: wantLocation })
 */
export function useGeolocation({ enabled = true, watch = false, ...options }: PositionOptions & { enabled?: boolean; watch?: boolean } = {}) {
  const [state, setState] = useState<GeolocationState>({ loading: enabled, error: null, coords: null, timestamp: null })
  const { enableHighAccuracy, timeout, maximumAge } = options

  useEffect(() => {
    if (!enabled) return
    if (!('geolocation' in navigator)) {
      setState({ loading: false, error: new Error('Geolocation is not supported'), coords: null, timestamp: null })
      return
    }
    setState((s) => ({ ...s, loading: true }))
    const ok = (p: GeolocationPosition) => setState({ loading: false, error: null, coords: p.coords, timestamp: p.timestamp })
    const fail = (error: GeolocationPositionError) => setState((s) => ({ ...s, loading: false, error }))
    const opts = { enableHighAccuracy, timeout, maximumAge }
    if (watch) {
      const id = navigator.geolocation.watchPosition(ok, fail, opts)
      return () => navigator.geolocation.clearWatch(id)
    }
    navigator.geolocation.getCurrentPosition(ok, fail, opts)
  }, [enabled, watch, enableHighAccuracy, timeout, maximumAge])

  return state
}
