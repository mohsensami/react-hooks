import { useEffect, useRef, useState } from 'react'
import { resolveTarget } from '../_internal'
import type { TargetLike } from '../_internal'
import { useLatest } from '../utils/useLatest'

export interface UseDropZoneOptions {
  onDrop?: (files: File[], event: DragEvent) => void
  /** accepted mime types / extensions, e.g. ['image/*', '.pdf'] */
  accept?: string[]
  multiple?: boolean
  /** max size in bytes per file */
  maxSize?: number
}

function accepted(file: File, accept?: string[]) {
  if (!accept?.length) return true
  return accept.some((a) =>
    a.startsWith('.') ? file.name.toLowerCase().endsWith(a.toLowerCase()) : a.endsWith('/*') ? file.type.startsWith(a.slice(0, -1)) : file.type === a,
  )
}

/**
 * Drag & drop files onto an element.
 * @example const { isOver, files } = useDropZone(ref, { accept: ['image/*'], onDrop: f => upload(f) })
 */
export function useDropZone(target: TargetLike<HTMLElement>, options: UseDropZoneOptions = {}) {
  const [isOver, setOver] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [rejected, setRejected] = useState<File[]>([])
  const opts = useLatest(options)
  const counter = useRef(0)

  useEffect(() => {
    const el = resolveTarget<HTMLElement>(target)
    if (!el) return
    const enter = (e: DragEvent) => {
      e.preventDefault()
      counter.current += 1
      setOver(true)
    }
    const over = (e: DragEvent) => e.preventDefault()
    const leave = (e: DragEvent) => {
      e.preventDefault()
      counter.current = Math.max(0, counter.current - 1)
      if (counter.current === 0) setOver(false)
    }
    const drop = (e: DragEvent) => {
      e.preventDefault()
      counter.current = 0
      setOver(false)
      const { accept, multiple = true, maxSize, onDrop } = opts.current
      let list = Array.from(e.dataTransfer?.files ?? [])
      const ok = list.filter((f) => accepted(f, accept) && (maxSize === undefined || f.size <= maxSize))
      setRejected(list.filter((f) => !ok.includes(f)))
      list = multiple ? ok : ok.slice(0, 1)
      setFiles(list)
      if (list.length) onDrop?.(list, e)
    }
    el.addEventListener('dragenter', enter)
    el.addEventListener('dragover', over)
    el.addEventListener('dragleave', leave)
    el.addEventListener('drop', drop)
    return () => {
      el.removeEventListener('dragenter', enter)
      el.removeEventListener('dragover', over)
      el.removeEventListener('dragleave', leave)
      el.removeEventListener('drop', drop)
    }
  }, [target, opts])

  return { isOver, files, rejected, reset: () => { setFiles([]); setRejected([]) } }
}
