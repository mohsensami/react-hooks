import { useCallback, useState } from 'react'

/**
 * Wizard / stepper state (steps are 1-based).
 * @example const { step, next, prev, goTo, isLast, progress } = useStep(4)
 */
export function useStep(maxStep: number, initialStep = 1) {
  const [step, setStep] = useState(Math.min(Math.max(1, initialStep), maxStep))
  const goTo = useCallback((s: number) => setStep(Math.min(Math.max(1, s), maxStep)), [maxStep])
  const next = useCallback(() => setStep((s) => Math.min(s + 1, maxStep)), [maxStep])
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 1)), [])
  const reset = useCallback(() => setStep(1), [])
  return {
    step,
    next,
    prev,
    goTo,
    reset,
    canNext: step < maxStep,
    canPrev: step > 1,
    isFirst: step === 1,
    isLast: step === maxStep,
    progress: maxStep <= 1 ? 100 : ((step - 1) / (maxStep - 1)) * 100,
  }
}
