'use client';

import * as React from 'react';

import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/ui';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  disabled = false
}) => {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [startY, setStartY] = React.useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || window.scrollY > 0) return;
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !startY || window.scrollY > 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || pullDistance < threshold) {
      setPullDistance(0);
      setStartY(null);
      return;
    }

    setIsRefreshing(true);
    
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setStartY(null);
    }
  };

  const pullProgress = Math.min(pullDistance / threshold, 1);

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 flex items-center justify-center transition-opacity',
          pullDistance > 0 ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: pullDistance,
          transform: `translateY(-${Math.max(0, pullDistance - 60)}px)`,
        }}
      >
        <div className="flex items-center space-x-2 text-gray-600">
          <RefreshCw
            className={cn(
              'h-5 w-5 transition-transform',
              isRefreshing && 'animate-spin',
              pullProgress >= 1 && !isRefreshing && 'rotate-180'
            )}
          />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform"
        style={{ transform: `translateY(${pullDistance}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};