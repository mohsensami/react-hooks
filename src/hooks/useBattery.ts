import { useEffect, useState } from 'react';

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

export interface BatteryState {
  isSupported: boolean;
  loading: boolean;
  charging: boolean;
  /** 0 – 1 */
  level: number;
  chargingTime: number;
  dischargingTime: number;
}

const initial: BatteryState = {
  isSupported: false,
  loading: true,
  charging: false,
  level: 1,
  chargingTime: 0,
  dischargingTime: Infinity,
};

/**
 * Battery Status API (Chromium only). `isSupported` is false elsewhere.
 *
 * @example
 * const { level, charging, isSupported } = useBattery();
 */
export function useBattery(): BatteryState {
  const [state, setState] = useState<BatteryState>(initial);

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    if (!nav.getBattery) {
      setState({ ...initial, loading: false });
      return;
    }
    let battery: BatteryManager | undefined;
    let cancelled = false;
    const update = () => {
      if (!battery || cancelled) return;
      setState({
        isSupported: true,
        loading: false,
        charging: battery.charging,
        level: battery.level,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      });
    };
    const events = ['chargingchange', 'levelchange', 'chargingtimechange', 'dischargingtimechange'];
    nav.getBattery().then((b) => {
      battery = b;
      update();
      events.forEach((e) => b.addEventListener(e, update));
    });
    return () => {
      cancelled = true;
      events.forEach((e) => battery?.removeEventListener(e, update));
    };
  }, []);

  return state;
}
