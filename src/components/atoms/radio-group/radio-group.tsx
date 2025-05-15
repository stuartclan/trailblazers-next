'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils/ui';
import { Label } from '../label/label';

const radioGroupItemVariants = cva(
  'radio-item aspect-square h-4 w-4 rounded-full border border-gray-300 bg-white text-primary shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300',
        error: 'border-red-500',
      },
      size: {
        default: 'h-4 w-4',
        sm: 'h-3 w-3',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends VariantProps<typeof radioGroupItemVariants> {
  options: RadioOption[];
  name?: string;
  value?: string;
  defaultValue?: string;
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  inline?: boolean;
  id?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({
    options,
    name,
    value,
    defaultValue,
    label,
    helpText,
    error,
    required,
    disabled,
    inline = false,
    id,
    className,
    variant,
    size,
    onValueChange,
    ...props
  }, ref) => {
    // Generate ID unconditionally to avoid React Hook conditional call warning
    const generatedId = React.useId();
    // Then use the provided ID if available, otherwise use the generated one
    const groupId = id || generatedId;
    
    // Handle variant choice based on error state
    const itemVariant = error ? 'error' : variant;

    return (
      <div className="radio-group-wrapper mb-4" ref={ref}>
        {label && (
          <Label
            required={required}
            className="mb-2 block"
          >
            {label}
          </Label>
        )}
        
        <RadioGroupPrimitive.Root
          name={name}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
          required={required}
          className={cn(
            'flex gap-6',
            inline ? 'flex-row' : 'flex-col',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupPrimitive.Item
                id={`${groupId}-${option.value}`}
                value={option.value}
                disabled={option.disabled || disabled}
                className={cn(
                  radioGroupItemVariants({ variant: itemVariant, size })
                )}
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <Circle className="h-2.5 w-2.5 fill-current text-current" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <Label
                htmlFor={`${groupId}-${option.value}`}
                className="cursor-pointer text-sm"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroupPrimitive.Root>
        
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

RadioGroup.displayName = 'RadioGroup';

export { RadioGroup };