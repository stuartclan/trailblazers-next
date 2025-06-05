'use client';

import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';

import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { cn } from '@/lib/utils/ui';

interface MobileOptimizedCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onTap?: () => void;
  swipeActions?: {
    left?: {
      icon: React.ReactNode;
      label: string;
      action: () => void;
      color?: string;
    };
    right?: {
      icon: React.ReactNode;
      label: string;
      action: () => void;
      color?: string;
    };
  };
  className?: string;
  hapticFeedback?: boolean;
}

export const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  title,
  subtitle,
  children,
  onTap,
  swipeActions,
  className,
  hapticFeedback = false,
}) => {
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [isSwipeActive, setIsSwipeActive] = React.useState(false);
  const [startX, setStartX] = React.useState<number | null>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX || !isSwipeActive || !swipeActions) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Limit swipe distance
    const maxSwipe = 100;
    const limitedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff));
    
    setSwipeOffset(limitedDiff);
  };

  const handleTouchEnd = () => {
    if (!isSwipeActive) return;
    
    const threshold = 50;
    
    if (Math.abs(swipeOffset) > threshold) {
      if (swipeOffset > 0 && swipeActions?.right) {
        // Haptic feedback
        if (hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(50);
        }
        swipeActions.right.action();
      } else if (swipeOffset < 0 && swipeActions?.left) {
        // Haptic feedback
        if (hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(50);
        }
        swipeActions.left.action();
      }
    }
    
    setSwipeOffset(0);
    setIsSwipeActive(false);
    setStartX(null);
  };

  const cardContent = (
    <Card 
      ref={cardRef}
      className={cn(
        'transition-transform duration-200 ease-out',
        onTap && 'cursor-pointer hover:shadow-md active:scale-[0.98]',
        className
      )}
      style={{
        transform: `translateX(${swipeOffset}px)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(title || subtitle) && (
        <CardHeader className="pb-3">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </CardHeader>
      )}
      <CardContent className={cn(title || subtitle ? 'pt-0' : '')}>
        {children}
      </CardContent>
    </Card>
  );

  if (onTap) {
    return (
      <TouchTarget 
        onClick={onTap} 
        haptic={hapticFeedback}
        className="block w-full"
        minSize={0}
      >
        {cardContent}
      </TouchTarget>
    );
  }

  return cardContent;
};
