import { useEffect, useRef, useState } from 'react'

/**
 * Avoids spinner flicker: shows loading only if it lasts longer than `delay`,
 * and keeps it visible for at least `minDuration` once shown.
 * @example const showSpinner = useDelayedLoading(isLoading, { delay: 200, minDuration: 500 })
 */
export function useDelayedLoading(loading: boolean, { delay = 200, minDuration = 500 } = {}) {
  const [show, setShow] = useState(false)
  const shownAt = useRef(0)
  const showRef = useRef(false)
  useEffect(() => {
    if (loading) {
      const id = setTimeout(() => {
        shownAt.current = Date.now()
        showRef.current = true
        setShow(true)
      }, delay)
      return () => clearTimeout(id)
    }
    if (showRef.current) {
      const id = setTimeout(
        () => {
          showRef.current = false
          setShow(false)
        },
        Math.max(0, minDuration - (Date.now() - shownAt.current)),
      )
      return () => clearTimeout(id)
    }
  }, [loading, delay, minDuration])
  return show
}
