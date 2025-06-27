'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cva, type VariantProps } from 'class-variance-authority';
import { LuCheck as Check, LuChevronDown as ChevronDown, LuChevronUp as ChevronUp } from 'react-icons/lu';
import { cn } from '@/lib/utils/ui';
import { Label } from '../label/label';

const selectTriggerVariants = cva(
  'select-trigger flex h-10 w-full items-center justify-between rounded-md border-1 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:ring-primary',
        error: 'border-red-500 focus:ring-red-500',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 text-xs',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends VariantProps<typeof selectTriggerVariants> {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  placeholder?: string;
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({
    options,
    value,
    defaultValue,
    name,
    placeholder = 'Select an option',
    label,
    helpText,
    error,
    required,
    disabled,
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
    const selectId = id || generatedId;

    // Handle variant choice based on error state
    const triggerVariant = error ? 'error' : variant;

    return (
      <div className="select-wrapper mb-4">
        {label && (
          <Label
            htmlFor={selectId}
            required={required}
            className="mb-2 block"
          >
            {label}
          </Label>
        )}

        <SelectPrimitive.Root
          value={value}
          defaultValue={defaultValue}
          name={name}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={selectId}
            className={cn(
              selectTriggerVariants({ variant: triggerVariant, size, className })
            )}
            aria-required={required}
            {...props}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon className="ml-2 h-4 w-4 opacity-50">
              <ChevronDown />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className="select-content relative z-50 min-w-[8rem] overflow-hidden rounded-md border-1 border-gray-200 bg-white text-gray-950 shadow-md animate-in fade-in-80"
              position="popper"
              sideOffset={5}
            >
              <SelectPrimitive.ScrollUpButton className="flex h-6 cursor-default items-center justify-center bg-white text-gray-700">
                <ChevronUp className="h-4 w-4" />
              </SelectPrimitive.ScrollUpButton>

              <SelectPrimitive.Viewport className="p-1">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className="select-item relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <Check className="h-4 w-4" />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>

              <SelectPrimitive.ScrollDownButton className="flex h-6 cursor-default items-center justify-center bg-white text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </SelectPrimitive.ScrollDownButton>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>

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

Select.displayName = 'Select';

export { Select };
