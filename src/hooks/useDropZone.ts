import { useCallback, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';

export interface UseDropZoneOptions {
  /** Accepted MIME types / extensions, like the `accept` attribute: `['image/*', '.pdf']` */
  accept?: string[];
  /** Max size per file in bytes */
  maxSize?: number;
  /** Max number of files (default: unlimited) */
  maxFiles?: number;
  /** Called with the valid files that were dropped */
  onDrop?: (files: File[], rejected: RejectedFile[]) => void;
  disabled?: boolean;
}

export interface RejectedFile {
  file: File;
  reason: 'type' | 'size' | 'count';
}

export interface UseDropZoneReturn {
  /** A file is currently being dragged over the zone */
  isOver: boolean;
  files: File[];
  rejected: RejectedFile[];
  /** Spread on the drop target element */
  handlers: {
    onDragEnter: (e: DragEvent) => void;
    onDragOver: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
  };
  /** Use with `<input type="file" onChange>` to accept the same validation */
  addFiles: (files: FileList | File[]) => void;
  clear: () => void;
  removeFile: (file: File) => void;
}

function matchesAccept(file: File, accept: string[]): boolean {
  return accept.some((rule) => {
    const pattern = rule.trim().toLowerCase();
    if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern);
    if (pattern.endsWith('/*')) return file.type.toLowerCase().startsWith(pattern.slice(0, -1));
    return file.type.toLowerCase() === pattern;
  });
}

/**
 * Drag & drop files with validation (type, size, count).
 *
 * @example
 * const { isOver, files, handlers } = useDropZone({ accept: ['image/*'], maxSize: 5 * 1024 * 1024 });
 * <div {...handlers} className={isOver ? 'over' : ''}>Drop images here</div>
 */
export function useDropZone(options: UseDropZoneOptions = {}): UseDropZoneReturn {
  const { accept, maxSize, maxFiles, onDrop, disabled = false } = options;
  const [isOver, setIsOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [rejected, setRejected] = useState<RejectedFile[]>([]);
  const dragDepth = useRef(0);
  const filesRef = useRef<File[]>([]);
  filesRef.current = files;

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      const valid: File[] = [];
      const invalid: RejectedFile[] = [];

      for (const file of list) {
        if (accept && accept.length > 0 && !matchesAccept(file, accept)) {
          invalid.push({ file, reason: 'type' });
        } else if (maxSize !== undefined && file.size > maxSize) {
          invalid.push({ file, reason: 'size' });
        } else if (maxFiles !== undefined && filesRef.current.length + valid.length >= maxFiles) {
          invalid.push({ file, reason: 'count' });
        } else {
          valid.push(file);
        }
      }

      setFiles((prev) => [...prev, ...valid]);
      setRejected(invalid);
      onDrop?.(valid, invalid);
    },
    [accept, maxSize, maxFiles, onDrop],
  );

  const handlers = useMemo(
    () => ({
      onDragEnter: (e: DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        dragDepth.current += 1;
        setIsOver(true);
      },
      onDragOver: (e: DragEvent) => {
        if (disabled) return;
        e.preventDefault(); // required to allow dropping
      },
      onDragLeave: (e: DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setIsOver(false);
      },
      onDrop: (e: DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        dragDepth.current = 0;
        setIsOver(false);
        if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
      },
    }),
    [disabled, addFiles],
  );

  const clear = useCallback(() => {
    setFiles([]);
    setRejected([]);
  }, []);

  const removeFile = useCallback((file: File) => setFiles((prev) => prev.filter((f) => f !== file)), []);

  return { isOver, files, rejected, handlers, addFiles, clear, removeFile };
}
