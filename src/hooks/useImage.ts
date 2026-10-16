import { useEffect, useState } from 'react';

export type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Preload an image and know when it is ready (skeletons, fallbacks).
 *
 * @example
 * const { status, image } = useImage(url);
 * if (status === 'loading') return <Skeleton />;
 */
export function useImage(src: string | null | undefined, options: { crossOrigin?: 'anonymous' | 'use-credentials' } = {}) {
  const [status, setStatus] = useState<ImageStatus>(src ? 'loading' : 'idle');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const { crossOrigin } = options;

  useEffect(() => {
    if (!src) {
      setStatus('idle');
      setImage(null);
      return;
    }
    setStatus('loading');
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => {
      setImage(img);
      setStatus('loaded');
    };
    img.onerror = () => {
      setImage(null);
      setStatus('error');
    };
    img.src = src;
    return () => {
      img.onload = img.onerror = null;
    };
  }, [src, crossOrigin]);

  return { status, image, isLoading: status === 'loading', isError: status === 'error' };
}
