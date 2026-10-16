import { useCallback, useEffect, useState } from 'react';

export interface UseGeolocationOptions extends PositionOptions {
  /** Keep watching the position (`watchPosition`) instead of a single read */
  watch?: boolean;
  /** Get position automatically on mount (default true) */
  immediate?: boolean;
}

/**
 * Geolocation API: coordinates, loading and error state.
 *
 * @example
 * const { coords, loading, error, refresh } = useGeolocation({ enableHighAccuracy: true });
 */
export function useGeolocation({ watch = false, immediate = true, ...position }: UseGeolocationOptions = {}) {
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [loading, setLoading] = useState(immediate);
  const { enableHighAccuracy, maximumAge, timeout } = position;

  const options: PositionOptions = { enableHighAccuracy, maximumAge, timeout };
  const optionsKey = JSON.stringify(options);

  const onSuccess = useCallback((p: GeolocationPosition) => {
    setCoords(p.coords);
    setTimestamp(p.timestamp);
    setError(null);
    setLoading(false);
  }, []);
  const onError = useCallback((e: GeolocationPositionError) => {
    setError(e);
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(onSuccess, onError, JSON.parse(optionsKey));
  }, [onSuccess, onError, optionsKey]);

  useEffect(() => {
    if (!immediate || typeof navigator === 'undefined' || !navigator.geolocation) return;
    if (watch) {
      const id = navigator.geolocation.watchPosition(onSuccess, onError, JSON.parse(optionsKey));
      return () => navigator.geolocation.clearWatch(id);
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError, JSON.parse(optionsKey));
  }, [immediate, watch, onSuccess, onError, optionsKey]);

  return {
    coords,
    timestamp,
    error,
    loading,
    refresh,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  };
}
