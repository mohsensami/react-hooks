import { useCallback, useEffect, useState } from 'react'
import { resolveTarget } from '../_internal'
import type { TargetLike } from '../_internal'

/**
 * Fullscreen API for an element (default: whole page).
 * @example const { isFullscreen, toggle } = useFullscreen(videoRef)
 */
export function useFullscreen(target?: TargetLike<HTMLElement>) {
  const [isFullscreen, setFull] = useState(false)
  const isSupported = typeof document !== 'undefined' && !!document.fullscreenEnabled

  useEffect(() => {
    const update = () => {
      const el = resolveTarget<HTMLElement>(target, document.documentElement)
      setFull(!!el && document.fullscreenElement === el)
    }
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [target])

  const enter = useCallback(
    async (options?: FullscreenOptions) => {
      const el = resolveTarget<HTMLElement>(target, document.documentElement)
      await el?.requestFullscreen(options)
    },
    [target],
  )
  const exit = useCallback(async () => {
    if (document.fullscreenElement) await document.exitFullscreen()
  }, [])
  const toggle = useCallback(() => (isFullscreen ? exit() : enter()), [isFullscreen, enter, exit])
  return { isFullscreen, isSupported, enter, exit, toggle }
}
