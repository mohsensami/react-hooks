import { useEffect, useState } from 'react'

/**
 * Preload an image and know its status.
 * @example const { status, image } = useImage('/photo.jpg')
 */
export function useImage(src: string | null | undefined, { crossOrigin }: { crossOrigin?: 'anonymous' | 'use-credentials' } = {}) {
  const [state, setState] = useState<{ status: 'idle' | 'loading' | 'loaded' | 'error'; image: HTMLImageElement | null }>({ status: src ? 'loading' : 'idle', image: null })
  useEffect(() => {
    if (!src) return setState({ status: 'idle', image: null })
    const img = new Image()
    if (crossOrigin) img.crossOrigin = crossOrigin
    setState({ status: 'loading', image: null })
    img.onload = () => setState({ status: 'loaded', image: img })
    img.onerror = () => setState({ status: 'error', image: null })
    img.src = src
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, crossOrigin])
  return state
}
