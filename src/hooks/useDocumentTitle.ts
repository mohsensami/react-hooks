import { useEffect } from 'react';

export interface UseDocumentTitleOptions {
  /** Put the previous title back when the component unmounts (default: true) */
  restoreOnUnmount?: boolean;
}

/**
 * Sets `document.title`.
 *
 * @example
 * useDocumentTitle(`(${unread}) Inbox`);
 */
export function useDocumentTitle(title: string, options: UseDocumentTitleOptions = {}): void {
  const { restoreOnUnmount = true } = options;

  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      if (restoreOnUnmount) document.title = previous;
    };
  }, [title, restoreOnUnmount]);
}
