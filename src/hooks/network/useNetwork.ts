import { useEffect, useState } from 'react'

interface NetworkInformation extends EventTarget {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
  type?: string
}

export interface NetworkState {
  online: boolean
  /** timestamp of the last online/offline change */
  since?: number
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

const getConn = () => (navigator as Navigator & { connection?: NetworkInformation }).connection

const read = (since?: number): NetworkState => {
  const c = typeof navigator !== 'undefined' ? getConn() : undefined
  return {
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
    since,
    effectiveType: c?.effectiveType,
    downlink: c?.downlink,
    rtt: c?.rtt,
    saveData: c?.saveData,
  }
}

/**
 * Online / offline + connection quality.
 * @example const { online, effectiveType } = useNetwork()
 */
export function useNetwork(): NetworkState {
  const [state, setState] = useState<NetworkState>(() => read())
  useEffect(() => {
    const update = () => setState(read(Date.now()))
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    const c = getConn()
    c?.addEventListener('change', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
      c?.removeEventListener('change', update)
    }
  }, [])
  return state
}

/** Just a boolean: is the browser online? */
export const useOnline = () => useNetwork().online
