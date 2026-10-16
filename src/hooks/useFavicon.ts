import { useEffect } from 'react';

/**
 * Changes the page favicon (e.g. notification badge, status color).
 * The original icon is restored on unmount.
 *
 * @example
 * useFavicon(hasUnread ? '/favicon-unread.png' : '/favicon.png');
 */
export function useFavicon(href: string | null | undefined): void {
  useEffect(() => {
    if (!href) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const created = !link;
    const previousHref = link?.href;

    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;

    return () => {
      if (!link) return;
      if (created) link.remove();
      else if (previousHref) link.href = previousHref;
    };
  }, [href]);
}
