'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as React from 'react';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/ui';

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  error?: string;
}

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, error, ...props }, ref) => {
  const chkId = React.useId();
  return (
    <div className="checkbox-wrapper">
      <div className="flex items-center">
        <CheckboxPrimitive.Root
          ref={ref}
          id={chkId}
          className={cn(
            'checkbox peer h-4 w-4 shrink-0 rounded-sm border-1 border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-white',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={cn('checkbox-indicator flex items-center justify-center')}
          >
            <Check className="h-3 w-3" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && (
          <label
            htmlFor={chkId}
            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <div className="mt-1 text-sm text-red-500">{error}</div>
      )}
    </div>
  )
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
