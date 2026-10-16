import { useEffect, useState } from 'react'

interface BatteryManager extends EventTarget {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

export interface BatteryState {
  isSupported: boolean
  loading: boolean
  /** 0 – 1 */
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

/** Battery status (Chromium only). @example const { level, charging } = useBattery() */
export function useBattery(): BatteryState {
  const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }) : undefined
  const isSupported = !!nav?.getBattery
  const [state, setState] = useState<BatteryState>({ isSupported, loading: isSupported, level: 1, charging: false, chargingTime: 0, dischargingTime: Infinity })

  useEffect(() => {
    if (!nav?.getBattery) return
    let battery: BatteryManager | undefined
    let alive = true
    const update = () => {
      if (battery && alive)
        setState({ isSupported: true, loading: false, level: battery.level, charging: battery.charging, chargingTime: battery.chargingTime, dischargingTime: battery.dischargingTime })
    }
    const events = ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange']
    nav.getBattery().then((b) => {
      battery = b
      update()
      events.forEach((e) => b.addEventListener(e, update))
    })
    return () => {
      alive = false
      events.forEach((e) => battery?.removeEventListener(e, update))
    }
  }, [nav])
  return state
}
