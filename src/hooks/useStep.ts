import { useCallback, useState } from 'react';
import { clamp } from './utils';

export interface UseStepReturn {
  /** Current step (1-based) */
  step: number;
  maxStep: number;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reset: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirst: boolean;
  isLast: boolean;
  /** 0 - 100 */
  progress: number;
}

/**
 * Wizard / stepper helper. Steps are 1-based.
 *
 * @example
 * const { step, next, prev, isLast } = useStep(4);
 */
export function useStep(maxStep: number, initialStep = 1): UseStepReturn {
  const [step, setStep] = useState(() => clamp(initialStep, 1, maxStep));

  const next = useCallback(() => setStep((s) => Math.min(s + 1, maxStep)), [maxStep]);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);
  const goTo = useCallback((target: number) => setStep(clamp(target, 1, maxStep)), [maxStep]);
  const reset = useCallback(() => setStep(clamp(initialStep, 1, maxStep)), [initialStep, maxStep]);

  return {
    step,
    maxStep,
    next,
    prev,
    goTo,
    reset,
    canGoNext: step < maxStep,
    canGoPrev: step > 1,
    isFirst: step === 1,
    isLast: step === maxStep,
    progress: maxStep <= 1 ? 100 : ((step - 1) / (maxStep - 1)) * 100,
  };
}
