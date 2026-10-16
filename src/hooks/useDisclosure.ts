import { useCallback, useState } from 'react'

export interface UseDisclosureOptions {
  onOpen?: () => void
  onClose?: () => void
}

/**
 * Open/close state for modals, drawers, popovers, dropdowns...
 * @example
 * const { isOpen, open, close, toggle } = useDisclosure()
 */
export function useDisclosure(initial = false, { onOpen, onClose }: UseDisclosureOptions = {}) {
  const [isOpen, setIsOpen] = useState(initial)
  const open = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) onOpen?.()
      return true
    })
  }, [onOpen])
  const close = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) onClose?.()
      return false
    })
  }, [onClose])
  const toggle = useCallback(() => (isOpen ? close() : open()), [isOpen, open, close])
  return { isOpen, open, close, toggle }
}
