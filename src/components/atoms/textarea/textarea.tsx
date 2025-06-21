'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/ui';
import { Label } from '../label/label';

const textareaVariants = cva(
  'textarea flex min-h-[80px] w-full rounded-md border-1 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:ring-primary',
        error: 'border-red-500 focus-visible:ring-red-500',
      },
      size: {
        default: 'min-h-[80px]',
        sm: 'min-h-[60px] text-xs',
        lg: 'min-h-[120px] text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  VariantProps<typeof textareaVariants> {
  label?: string;
  description?: string;
  helpText?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant,
    size,
    label,
    description,
    helpText,
    error,
    id,
    required,
    ...props
  }, ref) => {
    // Generate ID unconditionally to avoid React Hook conditional call warning
    const generatedId = React.useId();
    // Then use the provided ID if available, otherwise use the generated one
    const textareaId = id || generatedId;

    // Handle variant choice based on error state
    const textareaVariant = error ? 'error' : variant;

    return (
      <div className="textarea-wrapper flex flex-col space-y-1">
        {label && (
          <Label
            htmlFor={textareaId}
            required={required}
            className={cn('leading-none', error ? 'text-red-500' : 'text-gray-900')}
          >
            {label}
          </Label>
        )}

        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}

        <textarea
          id={textareaId}
          className={cn(
            textareaVariants({ variant: textareaVariant, size, className }),
          )}
          ref={ref}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${textareaId}-error` : helpText ? `${textareaId}-description` : undefined}
          {...props}
        />

        {helpText && !error && (
          <p
            id={`${textareaId}-description`}
            className="mb-2 text-xs text-gray-400"
          >
            {helpText}
          </p>
        )}

        {error && (
          <p
            id={`${textareaId}-error`}
            className="mb-2 text-sm text-red-500"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
