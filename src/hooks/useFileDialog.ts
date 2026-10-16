import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseFileDialogOptions {
  /** `accept` attribute, e.g. 'image/*,.pdf' */
  accept?: string;
  multiple?: boolean;
  /** Mobile camera hint: 'user' | 'environment' */
  capture?: 'user' | 'environment';
  /** Select a whole folder */
  directory?: boolean;
  /** Called after the user picks files */
  onChange?: (files: File[]) => void;
}

export interface UseFileDialogReturn {
  files: File[];
  /** Open the native file picker (must be called from a user gesture, e.g. click) */
  open: () => void;
  reset: () => void;
}

/**
 * Open the native file picker from code — no hidden `<input>` needed in your JSX.
 *
 * @example
 * const { files, open } = useFileDialog({ accept: 'image/*', multiple: true });
 * <button onClick={open}>Choose images</button>
 */
export function useFileDialog(options: UseFileDialogOptions = {}): UseFileDialogReturn {
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const picked = Array.from(input.files ?? []);
      setFiles(picked);
      optionsRef.current.onChange?.(picked);
    });
    document.body.appendChild(input);
    inputRef.current = input;

    return () => {
      input.remove();
      inputRef.current = null;
    };
  }, []);

  const open = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    const { accept, multiple = false, capture, directory = false } = optionsRef.current;

    input.value = '';
    input.accept = accept ?? '';
    input.multiple = multiple;
    if (capture) input.setAttribute('capture', capture);
    else input.removeAttribute('capture');
    if (directory) input.setAttribute('webkitdirectory', '');
    else input.removeAttribute('webkitdirectory');

    input.click();
  }, []);

  const reset = useCallback(() => {
    setFiles([]);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  return { files, open, reset };
}
