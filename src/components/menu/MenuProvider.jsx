import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const MenuContext = createContext(null);

export const useMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error('useMenu must be used inside a MenuProvider');
  }
  return ctx;
};

const safeIndex = (value, itemCount, loop) => {
  if (itemCount === 0) return 0;
  if (loop) return ((value % itemCount) + itemCount) % itemCount;
  return Math.min(Math.max(value, 0), itemCount - 1);
};

/**
 * MenuProvider centralizes focus, keyboard controls, and activation for menu-like lists.
 * It accepts a list of items with arbitrary payloads so the menu can be reused
 * for main navigation, pause overlays, and future game contexts.
 */
const MenuProvider = ({
  id = 'menu',
  items = [],
  children,
  initialFocus = 0,
  active = true,
  loop = true,
  enableLogging = false,
  onAction,
  onFocusChange,
}) => {
  const itemCount = items.length;
  const [focusIndex, setFocusIndex] = useState(() => safeIndex(initialFocus, itemCount, loop));

  const focusNext = useCallback(() => setFocusIndex((idx) => safeIndex(idx + 1, itemCount, loop)), [itemCount, loop]);
  const focusPrev = useCallback(() => setFocusIndex((idx) => safeIndex(idx - 1, itemCount, loop)), [itemCount, loop]);

  const activate = useCallback(
    (index) => {
      const currentIndex = typeof index === 'number' ? index : focusIndex;
      const item = items[currentIndex];
      if (!item || item.disabled) return;

      if (enableLogging) {
        const label = item.key || item.label || `item-${currentIndex}`;
        console.debug(`[menu:${id}] activate`, label);
      }

      if (item.onSelect) item.onSelect(item, currentIndex);
      if (onAction) onAction(item, currentIndex);
    },
    [enableLogging, focusIndex, id, items, onAction]
  );

  useEffect(() => {
    setFocusIndex((idx) => safeIndex(idx, itemCount, loop));
  }, [itemCount, loop]);

  useEffect(() => {
    setFocusIndex(safeIndex(initialFocus, itemCount, loop));
  }, [initialFocus, itemCount, loop]);

  useEffect(() => {
    if (!active) return undefined;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          focusNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusPrev();
          break;
        case 'Enter':
          e.preventDefault();
          activate();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, focusNext, focusPrev, activate]);

  useEffect(() => {
    if (onFocusChange) {
      onFocusChange(focusIndex);
    }
  }, [focusIndex, onFocusChange]);

  const value = useMemo(
    () => ({
      id,
      items,
      focusIndex,
      setFocusIndex,
      activate,
      focusNext,
      focusPrev,
      active,
    }),
    [activate, focusIndex, focusNext, focusPrev, id, items, active]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export default MenuProvider;
