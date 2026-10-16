import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export interface GestureState {
  /** Pinch scale relative to the gesture start (1 = no change) */
  scale: number;
  /** Rotation in degrees relative to the start of the gesture */
  rotation: number;
  /** Pan offset in px */
  x: number;
  y: number;
  isGesturing: boolean;
}

export interface UseGestureOptions {
  minScale?: number;
  maxScale?: number;
  /** Disable specific gestures */
  pan?: boolean;
  pinch?: boolean;
  rotate?: boolean;
  /** Ctrl + wheel (and trackpad pinch) zooms (default: true) */
  wheelZoom?: boolean;
}

const INITIAL: GestureState = { scale: 1, rotation: 0, x: 0, y: 0, isGesturing: false };

/**
 * Pan / pinch-to-zoom / rotate with 1–2 pointers (touch, mouse, pen) and
 * Ctrl+wheel zoom. Apply `state` to a CSS transform.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const { state, reset } = useGesture(ref);
 * <div ref={ref} style={{ touchAction: 'none' }}>
 *   <img style={{ transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale}) rotate(${state.rotation}deg)` }} />
 * </div>
 */
export function useGesture<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: UseGestureOptions = {},
): { state: GestureState; reset: () => void } {
  const { minScale = 0.5, maxScale = 5, pan = true, pinch = true, rotate = true, wheelZoom = true } = options;
  const [state, setState] = useState<GestureState>(INITIAL);
  const committed = useRef<GestureState>(INITIAL);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const pointers = new Map<number, { x: number; y: number }>();
    let startDistance = 0;
    let startAngle = 0;
    let startCenter = { x: 0, y: 0 };
    let base = committed.current;

    const clampScale = (s: number) => Math.min(maxScale, Math.max(minScale, s));
    const metrics = () => {
      const [a, b] = Array.from(pointers.values()) as [{ x: number; y: number }, { x: number; y: number }];
      return {
        distance: Math.hypot(b.x - a.x, b.y - a.y),
        angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
        center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      };
    };

    const beginGesture = () => {
      base = committed.current;
      if (pointers.size === 1) {
        startCenter = Array.from(pointers.values())[0] as { x: number; y: number };
      } else if (pointers.size === 2) {
        const m = metrics();
        startDistance = m.distance || 1;
        startAngle = m.angle;
        startCenter = m.center;
      }
    };

    const update = (next: Partial<GestureState>) => {
      const merged = { ...committed.current, ...next, isGesturing: true };
      committed.current = { ...merged, isGesturing: false };
      setState(merged);
    };

    const onDown = (event: PointerEvent) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      el.setPointerCapture?.(event.pointerId);
      beginGesture();
      setState((s) => ({ ...s, isGesturing: true }));
    };

    const onMove = (event: PointerEvent) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 1 && pan) {
        const p = Array.from(pointers.values())[0] as { x: number; y: number };
        update({ x: base.x + (p.x - startCenter.x), y: base.y + (p.y - startCenter.y) });
      } else if (pointers.size === 2) {
        const m = metrics();
        update({
          scale: pinch ? clampScale(base.scale * (m.distance / startDistance)) : base.scale,
          rotation: rotate ? base.rotation + (m.angle - startAngle) : base.rotation,
          x: pan ? base.x + (m.center.x - startCenter.x) : base.x,
          y: pan ? base.y + (m.center.y - startCenter.y) : base.y,
        });
      }
    };

    const onUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      beginGesture();
      if (pointers.size === 0) setState({ ...committed.current, isGesturing: false });
    };

    const onWheel = (event: WheelEvent) => {
      if (!wheelZoom || !event.ctrlKey) return;
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.01);
      const scale = clampScale(committed.current.scale * factor);
      committed.current = { ...committed.current, scale };
      setState({ ...committed.current, isGesturing: false });
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, [ref, minScale, maxScale, pan, pinch, rotate, wheelZoom]);

  const reset = () => {
    committed.current = INITIAL;
    setState(INITIAL);
  };

  return { state, reset };
}
