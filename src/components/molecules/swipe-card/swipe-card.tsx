'use client';

import * as React from 'react';

import { cn } from '@/lib/utils/ui';

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  className
}) => {
  const [startX, setStartX] = React.useState<number | null>(null);
  const [currentX, setCurrentX] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX || !isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!startX || currentX === null) {
      setIsDragging(false);
      setStartX(null);
      setCurrentX(null);
      return;
    }

    const diff = currentX - startX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (diff < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setIsDragging(false);
    setStartX(null);
    setCurrentX(null);
  };

  const translateX = isDragging && startX && currentX ? currentX - startX : 0;

  return (
    <div
      className={cn(
        'touch-pan-x transition-transform',
        isDragging ? 'transition-none' : 'transition-transform duration-200',
        className
      )}
      style={{
        transform: `translateX(${translateX}px)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};