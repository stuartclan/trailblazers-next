'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/ui';
import { Slot } from '@radix-ui/react-slot';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';

// Define button variants using class-variance-authority
const buttonVariants = cva(
  'button inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-dark',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border-1 border-primary text-primary hover:bg-primary-light hover:text-white',
        secondary: 'bg-primary-light text-white hover:bg-secondary-dark',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 rounded-md text-xs',
        lg: 'h-12 px-6 rounded-md text-base',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /**
   * Whether to wrap the button in TouchTarget for enhanced mobile interactions
   */
  enableTouch?: boolean;
  /**
   * Whether to show ripple effect on touch (only applies when enableTouch is true)
   */
  ripple?: boolean;
  /**
   * Whether to provide haptic feedback on touch (only applies when enableTouch is true)
   */
  haptic?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    enableTouch = true, // Enable touch by default for better mobile UX
    ripple = true,
    haptic = false,
    disabled,
    children,
    onClick,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";

    const buttonElement = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {children}
      </Comp>
    );

    // // Wrap in TouchTarget for enhanced mobile interactions if enabled
    // if (enableTouch && !asChild) {
    //   return (
    //     <TouchTarget
    //       ripple={ripple}
    //       haptic={haptic}
    //       disabled={disabled}
    //       onClick={onClick}
    //       className="inline-flex"
    //     >
    //       <Comp
    //         className={cn(buttonVariants({ variant, size, className }))}
    //         ref={ref}
    //         disabled={disabled}
    //         onClick={undefined} // Let TouchTarget handle the click
    //         {...props}
    //       >
    //         {children}
    //       </Comp>
    //     </TouchTarget>
    //   );
    // }

    return buttonElement;
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
