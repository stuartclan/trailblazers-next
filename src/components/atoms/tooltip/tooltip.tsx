'use client';

import * as React from 'react';
import * as TooltipPrimitives from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils/ui';

const TooltipProvider = TooltipPrimitives.Provider;

const Tooltip = ({ ...props }: React.ComponentPropsWithoutRef<typeof TooltipPrimitives.Root>) => {
  return (
    <TooltipPrimitives.Root
      {...props}
    />
  );
};
Tooltip.displayName = 'Tooltip';

// interface TooltipTriggerProps extends 
//   React.ComponentPropsWithoutRef<typeof TooltipPrimitives.Trigger>,
//   VariantProps<typeof tooltipVariants> {}

const TooltipTrigger = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitives.Trigger>
>(({ ...props }, ref) => (
  <TooltipPrimitives.Trigger
    ref={ref}
    {...props}
  />
));
TooltipTrigger.displayName = 'Trigger';

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitives.Content>
>(({ className, children, ...props }, ref) => (
  <TooltipPrimitives.Portal
  // forceMount
  >
    <TooltipPrimitives.Content
      ref={ref}
      className={cn(
        'px-2 py-1 text-sm bg-black/50 text-white rounded-md',
        className
      )}
      {...props}
    >
      <TooltipPrimitives.Arrow
        className='fill-black/50'
      />
      {children}
    </TooltipPrimitives.Content>
  </TooltipPrimitives.Portal>
));
TooltipContent.displayName = 'Content';

// const TooltipArrow = React.forwardRef<
//   React.ComponentRef<typeof TooltipPrimitives.Arrow>,
//   React.ComponentPropsWithoutRef<typeof TooltipPrimitives.Arrow>
// >(({ ...props }, ref) => (
//   <TooltipPrimitives.Arrow
//     className='fill-black/50'
//     ref={ref}
//     {...props}
//   />
// ));
// TooltipArrow.displayName = 'Arrow';

type TooltipProps = React.ComponentPropsWithoutRef<typeof Tooltip>;

export {
  type TooltipProps,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  // TooltipArrow,
};
