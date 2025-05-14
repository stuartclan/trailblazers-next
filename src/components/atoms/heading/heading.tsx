'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/ui';

const headingVariants = cva(
  'heading font-bold tracking-tight text-gray-900',
  {
    variants: {
      level: {
        h1: 'text-3xl lg:text-4xl',
        h2: 'text-2xl lg:text-3xl',
        h3: 'text-xl lg:text-2xl',
        h4: 'text-lg lg:text-xl',
        h5: 'text-base lg:text-lg',
        h6: 'text-base',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
    defaultVariants: {
      level: 'h2',
      weight: 'bold',
      align: 'left',
    },
  }
);

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, weight, align, as, children, ...props }, ref) => {
    const Element = as || level || 'h2';

    return (
      <Element
        ref={ref}
        className={cn(headingVariants({ level, weight, align, className }))}
        {...props}
      >
        {children}
      </Element>
    );
  }
);

Heading.displayName = 'Heading';

export { Heading };