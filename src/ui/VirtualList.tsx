import { ReactNode } from 'react';
import { useVirtualList } from './useVirtualList';

interface VirtualListProps {
  items: unknown[];
  renderItem: (item: unknown, index: number) => ReactNode;
  itemHeight: number;
  overscan?: number;
  height?: number;
}

export function VirtualList({ items, renderItem, itemHeight, overscan = 5, height = 500 }: VirtualListProps) {
  const { visibleRange, onScroll, containerStyle, spacerTop, spacerBottom } = useVirtualList({
    itemHeight,
    containerHeight: height,
    totalItems: items.length,
    overscan,
  });

  const visibleItems = items.slice(visibleRange.startIndex, visibleRange.endIndex);

  return (
    <div onScroll={onScroll} style={containerStyle}>
      <div style={{ height: spacerTop }} />
      {visibleItems.map((item, i) => (
        <div key={visibleRange.startIndex + i} style={{ height: itemHeight }}>
          {renderItem(item, visibleRange.startIndex + i)}
        </div>
      ))}
      <div style={{ height: spacerBottom }} />
    </div>
  );
}
