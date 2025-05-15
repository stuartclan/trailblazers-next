'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/ui';
import { Label } from '../label/label';

const switchVariants = cva(
  'switch relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gray-200 data-[state=checked]:bg-primary',
        error: 'bg-red-100 data-[state=checked]:bg-red-500',
      },
      size: {
        default: 'h-[24px] w-[44px]',
        sm: 'h-[20px] w-[36px]',
        lg: 'h-[28px] w-[52px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const switchThumbVariants = cva(
  'switch-thumb pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        default: 'h-5 w-5 data-[state=checked]:translate-x-5',
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4',
        lg: 'h-6 w-6 data-[state=checked]:translate-x-6',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  label?: string;
  helpText?: string;
  error?: string;
  labelPosition?: 'left' | 'right';
}

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(
  ({ 
    className, 
    variant, 
    size, 
    label, 
    helpText, 
    error, 
    checked,
    defaultChecked,
    required,
    id,
    labelPosition = 'right',
    ...props 
  }, ref) => {
    // Generate ID unconditionally to avoid React Hook conditional call warning
    const generatedId = React.useId();
    // Then use the provided ID if available, otherwise use the generated one
    const switchId = id || generatedId;
    
    // Handle variant choice based on error state
    const switchVariant = error ? 'error' : variant;

    return (
      <div className="switch-wrapper mb-4">
        <div className={cn(
          'flex items-center gap-2',
          labelPosition === 'left' ? 'flex-row-reverse justify-end' : 'flex-row'
        )}>
          <SwitchPrimitive.Root
            id={switchId}
            checked={checked}
            defaultChecked={defaultChecked}
            className={cn(
              switchVariants({ variant: switchVariant, size, className })
            )}
            ref={ref}
            {...props}
          >
            <SwitchPrimitive.Thumb className={cn(
              switchThumbVariants({ size })
            )} />
          </SwitchPrimitive.Root>
          
          {label && (
            <Label
              htmlFor={switchId}
              required={required}
              className="cursor-pointer"
            >
              {label}
            </Label>
          )}
        </div>
        
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helpText}</p>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };