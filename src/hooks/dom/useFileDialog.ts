import { useCallback, useState } from 'react'

export interface UseFileDialogOptions {
  accept?: string
  multiple?: boolean
  /** use camera on mobile: 'user' | 'environment' */
  capture?: string
  directory?: boolean
}

/**
 * Open the native file picker from code (no <input> needed in JSX).
 * @example const { open, files } = useFileDialog({ accept: 'image/*', multiple: true })
 */
export function useFileDialog({ accept, multiple = false, capture, directory = false }: UseFileDialogOptions = {}) {
  const [files, setFiles] = useState<File[]>([])
  const open = useCallback(
    (overrides: UseFileDialogOptions = {}) =>
      new Promise<File[]>((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = overrides.accept ?? accept ?? ''
        input.multiple = overrides.multiple ?? multiple
        const cap = overrides.capture ?? capture
        if (cap) input.setAttribute('capture', cap)
        if (overrides.directory ?? directory) input.setAttribute('webkitdirectory', '')
        input.onchange = () => {
          const list = Array.from(input.files ?? [])
          setFiles(list)
          resolve(list)
        }
        input.oncancel = () => resolve([])
        input.click()
      }),
    [accept, multiple, capture, directory],
  )
  return { files, open, reset: () => setFiles([]) }
}
