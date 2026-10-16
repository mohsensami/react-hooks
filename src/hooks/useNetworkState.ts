import { useEffect, useState } from 'react';

export interface NetworkState {
  online: boolean;
  /** 'slow-2g' | '2g' | '3g' | '4g' (Chromium only) */
  effectiveType?: string;
  /** Estimated downlink in Mbps */
  downlink?: number;
  /** Estimated round trip time in ms */
  rtt?: number;
  /** User enabled data saver mode */
  saveData?: boolean;
  /** 'wifi' | 'cellular' | ... */
  type?: string;
}

interface NetworkInformationLike extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
}

const getConnection = (): NetworkInformationLike | undefined =>
  (navigator as Navigator & { connection?: NetworkInformationLike }).connection;

function readNetwork(): NetworkState {
  const connection = getConnection();
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    saveData: connection?.saveData,
    type: connection?.type,
  };
}

/**
 * Detailed network information (online state + connection quality where supported).
 *
 * @example
 * const { online, effectiveType, downlink } = useNetworkState();
 */
export function useNetworkState(): NetworkState {
  const [state, setState] = useState<NetworkState>(() =>
    typeof navigator === 'undefined' ? { online: true } : readNetwork(),
  );

  useEffect(() => {
    const update = () => setState(readNetwork());
    const connection = getConnection();

    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    connection?.addEventListener('change', update);
    update();

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      connection?.removeEventListener('change', update);
    };
  }, []);

  return state;
}
