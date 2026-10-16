import { useEffect } from 'react';

let lockCount = 0;
let original: { overflow: string; paddingRight: string } | null = null;

function lock() {
  if (lockCount === 0) {
    const { body, documentElement } = document;
    original = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const currentPadding = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`; // avoid layout shift
    }
  }
  lockCount += 1;
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0 && original) {
    document.body.style.overflow = original.overflow;
    document.body.style.paddingRight = original.paddingRight;
    original = null;
  }
}

/**
 * Prevents the page from scrolling (modals, drawers, lightboxes).
 * Supports nesting: the lock is released when the last lock is removed.
 *
 * @example
 * useLockBodyScroll(isModalOpen);
 */
export function useLockBodyScroll(locked = true): void {
  useEffect(() => {
    if (!locked) return;
    lock();
    return unlock;
  }, [locked]);
}
