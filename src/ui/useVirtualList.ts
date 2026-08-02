// Virtual scrolling hook (#34)
// Uses calculateVirtualWindow from code-quality.ts to render only visible items.

import { useState, useRef, useCallback, UIEvent } from 'react';
import { calculateVirtualWindow, VirtualWindow } from '../simulation/code-quality';

interface UseVirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  overscan?: number;
}

interface UseVirtualListResult {
  visibleRange: VirtualWindow;
  onScroll: (e: UIEvent<HTMLElement>) => void;
  containerStyle: React.CSSProperties;
  spacerTop: number;
  spacerBottom: number;
}

export function useVirtualList({
  itemHeight,
  containerHeight,
  totalItems,
  overscan = 5,
}: UseVirtualListOptions): UseVirtualListResult {
  const [scrollTop, setScrollTop] = useState(0);
  const rafRef = useRef<number | null>(null);

  const onScroll = useCallback((e: UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
    });
  }, []);

  const visibleRange = calculateVirtualWindow(scrollTop, containerHeight, itemHeight, totalItems, overscan);

  const containerStyle: React.CSSProperties = {
    height: containerHeight,
    overflow: 'auto',
    position: 'relative',
  };

  const spacerTop = visibleRange.startIndex * itemHeight;
  const spacerBottom = Math.max(0, (totalItems - visibleRange.endIndex) * itemHeight);

  return { visibleRange, onScroll, containerStyle, spacerTop, spacerBottom };
}
