import { useEffect } from 'react';

/**
 * Custom hook for keyboard navigation in menus
 * Enhanced with proper event handling and cleanup
 */
const useKeyboardNavigation = (isActive, focusIndex, setFocusIndex, itemCount, onSelect) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex((i) => (i + 1) % itemCount);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex((i) => (i - 1 + itemCount) % itemCount);
          break;
        case 'Enter':
          e.preventDefault();
          if (onSelect) {
            onSelect(focusIndex);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, focusIndex, setFocusIndex, itemCount, onSelect]);
};

export default useKeyboardNavigation;
