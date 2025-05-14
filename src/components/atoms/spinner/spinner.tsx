'use client';

import * as React from 'react';

import { cn } from '@/lib/utils/ui';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-3',
};

const colorMap = {
  primary: 'border-primary border-t-transparent',
  secondary: 'border-secondary border-t-transparent',
  white: 'border-white border-t-transparent',
};

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', color = 'primary', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'spinner inline-block animate-spin rounded-full',
          sizeMap[size],
          colorMap[color],
          className
        )}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export { Spinner };