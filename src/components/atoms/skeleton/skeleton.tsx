'use client';

import * as React from 'react';

import { cn } from '@/lib/utils/ui';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The width of the skeleton
   */
  width?: string | number;
  /**
   * The height of the skeleton
   */
  height?: string | number;
  /**
   * Whether the skeleton should be circular
   */
  circle?: boolean;
  /**
   * Whether to show the shimmer animation
   */
  animate?: boolean;
  /**
   * Number of lines for text skeleton
   */
  lines?: number;
  /**
   * Variant of the skeleton
   */
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({
    className,
    width,
    height,
    circle = false,
    animate = true,
    lines = 1,
    variant = 'rectangular',
    style,
    ...props
  }, ref) => {
    const skeletonStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    if (lines > 1) {
      return (
        <div className={cn('space-y-2', className)} ref={ref} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'bg-gray-200 rounded',
                animate && 'animate-pulse',
                index === lines - 1 && 'w-3/4' // Last line is shorter
              )}
              style={{
                height: height || '1rem',
                width: index === lines - 1 ? '75%' : '100%',
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-200',
          animate && 'animate-pulse',
          circle && 'rounded-full',
          variant === 'text' && 'rounded h-4',
          variant === 'rectangular' && 'rounded',
          variant === 'circular' && 'rounded-full',
          variant === 'rounded' && 'rounded-lg',
          className
        )}
        style={skeletonStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Specialized skeleton components for common use cases

/**
 * Avatar skeleton
 */
export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 64,
  };

  return <Skeleton circle width={sizeMap[size]} height={sizeMap[size]} />;
};

/**
 * Button skeleton
 */
export const SkeletonButton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeMap = {
    sm: { width: 80, height: 32 },
    md: { width: 120, height: 40 },
    lg: { width: 160, height: 48 },
  };

  return <Skeleton variant="rounded" {...sizeMap[size]} />;
};

/**
 * Card skeleton
 */
export const SkeletonCard: React.FC<{
  showAvatar?: boolean;
  lines?: number;
  className?: string;
}> = ({ showAvatar = false, lines = 3, className }) => {
  return (
    <div className={cn('p-6 bg-white rounded-md border-1 space-y-4', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <SkeletonAvatar />
          <div className="space-y-2">
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={80} />
          </div>
        </div>
      )}
      <Skeleton lines={lines} />
      <div className="flex space-x-2">
        <SkeletonButton size="sm" />
        <SkeletonButton size="sm" />
      </div>
    </div>
  );
};

/**
 * Table row skeleton
 */
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="py-3 px-4">
          <Skeleton variant="text" />
        </td>
      ))}
    </tr>
  );
};

/**
 * Activity selector skeleton
 */
export const SkeletonActivitySelector: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col items-center justify-center p-4 border-1 rounded-lg">
          <Skeleton circle width={48} height={48} className="mb-2" />
          <Skeleton variant="text" width={60} />
        </div>
      ))}
    </div>
  );
};

/**
 * Search results skeleton
 */
export const SkeletonSearchResults: React.FC<{ className?: string, count?: number }> = ({ className, count = 3 }) => {
  return (
    <div className={cn("border-1 rounded-md overflow-hidden divide-y", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center p-3">
          <SkeletonAvatar size="sm" />
          <div className="ml-3 space-y-2 flex-1">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Check-in flow skeleton
 */
export const SkeletonCheckInFlow: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("bg-white rounded-md border-1 p-6 space-y-6", className)}>
      <div className="space-y-2">
        <Skeleton variant="text" width="40%" height={28} />
        <Skeleton variant="text" width="60%" />
      </div>

      <div className="space-y-4">
        <Skeleton variant="text" width="30%" />
        <div className="relative">
          <Skeleton height={40} variant="rounded" />
        </div>
      </div>

      <SkeletonActivitySelector count={3} />

      <div className="flex space-x-3">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  );
};

export { Skeleton };
