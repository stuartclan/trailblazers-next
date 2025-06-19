'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/ui';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-dark',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark',
        success: 'bg-green-100 text-green-800 hover:bg-green-200',
        destructive: 'bg-red-100 text-red-800 hover:bg-red-200',
        outline: 'border-1 border-gray-200 text-gray-700 hover:bg-gray-100',
        ghost: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      },
      size: {
        default: 'text-xs',
        sm: 'text-[10px] px-2 py-0.5',
        lg: 'text-sm px-3 py-0.5',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, className }))} {...props} />
  );
}

export { Badge, badgeVariants };