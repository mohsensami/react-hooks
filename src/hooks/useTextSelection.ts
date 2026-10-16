import { useEffect, useState } from 'react';

export interface TextSelectionState {
  text: string;
  rect: DOMRect | null;
}

/**
 * Track the text the user currently selects on the page (floating toolbars, "share quote").
 *
 * @example
 * const { text, rect } = useTextSelection();
 */
export function useTextSelection(): TextSelectionState {
  const [state, setState] = useState<TextSelectionState>({ text: '', rect: null });

  useEffect(() => {
    const onChange = () => {
      const sel = window.getSelection();
      const text = sel?.toString() ?? '';
      setState({
        text,
        rect: text && sel && sel.rangeCount ? sel.getRangeAt(0).getBoundingClientRect() : null,
      });
    };
    document.addEventListener('selectionchange', onChange);
    return () => document.removeEventListener('selectionchange', onChange);
  }, []);

  return state;
}
