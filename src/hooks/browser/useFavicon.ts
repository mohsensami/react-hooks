import { useEffect } from 'react'

/** Changes the page favicon. @example useFavicon(unread ? '/dot.png' : '/favicon.ico') */
export function useFavicon(href: string) {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    const created = !link
    const prev = link?.href
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = href
    return () => {
      if (created) link!.remove()
      else if (prev) link!.href = prev
    }
  }, [href])
}
