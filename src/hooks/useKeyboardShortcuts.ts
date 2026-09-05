import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
};

export const useKeyboardShortcuts = (
  shortcuts: { combo: KeyCombo; callback: (e: KeyboardEvent) => void }[]
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea (unless it's Escape)
      const activeElement = document.activeElement;
      const isInput = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
      
      if (isInput && event.key !== 'Escape') {
        return;
      }

      for (const { combo, callback } of shortcuts) {
        const matchKey = event.key.toLowerCase() === combo.key.toLowerCase();
        const matchCtrl = !!combo.ctrlKey === event.ctrlKey;
        const matchMeta = !!combo.metaKey === event.metaKey;
        const matchShift = !!combo.shiftKey === event.shiftKey;
        const matchAlt = !!combo.altKey === event.altKey;

        if (matchKey && matchCtrl && matchMeta && matchShift && matchAlt) {
          event.preventDefault();
          callback(event);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
