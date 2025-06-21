'use client';

import * as React from 'react';

import { cn } from '@/lib/utils/ui';
import { useMaterialIcons } from '@/lib/utils/material-icons';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  color?:
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'muted'
  | 'inherit';
}

const sizeMap = {
  xs: '!text-sm',
  sm: '!text-base',
  md: '!text-lg',
  lg: '!text-xl',
  xl: '!text-2xl',
  xxl: '!text-4xl',
};

const colorMap = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  muted: 'text-gray-500',
  inherit: 'text-inherit',
};

const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ name, size = 'md', color = 'inherit', className, ...props }, ref) => {
    // Load Material Icons stylesheet
    useMaterialIcons();

    return (
      <span
        ref={ref}
        className={cn(
          'material-icons',
          sizeMap[size],
          colorMap[color],
          className
        )}
        {...props}
      >
        {name}
      </span>
    );
  }
);

Icon.displayName = 'Icon';

export { Icon };
