'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Returns a ref to attach to a menu/dropdown container. While `isOpen`,
 * calls `onClose` when the user clicks outside the referenced element or
 * presses Escape — standard menu-dismissal behavior.
 */
export function useDismissableMenu<T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return ref;
}
