'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/ui';
import { Label } from '../label/label';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from '../tooltip/tooltip';

const inputVariants = cva(
  'input flex h-10 w-full rounded-md border-1 bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:ring-primary',
        error: 'border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 focus-visible:ring-green-500',
      },
      size: {
        default: 'h-10 px-3 py-2',
        sm: 'h-8 px-2 py-1 text-xs',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  label?: string;
  description?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helpText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    size,
    label,
    description,
    error,
    type = 'text',
    leftIcon,
    rightIcon,
    id,
    required,
    helpText,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    // Generate ID unconditionally to avoid React Hook conditional call warning
    const generatedId = React.useId();
    // Then use the provided ID if available, otherwise use the generated one
    const inputId = id || generatedId;

    // When the type is password, we need to handle the show/hide functionality
    const togglePassword = () => {
      setShowPassword(prev => !prev);
    };

    // Determine the effective type for password fields
    const effectiveType = type === 'password' && showPassword ? 'text' : type;

    // Generate a password toggle icon if needed
    const passwordToggle = type === 'password' ? (
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        onClick={togglePassword}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    ) : null;

    // Handle variant choice based on error state
    const inputVariant = error ? 'error' : variant;

    return (
      <div className="input-wrapper flex flex-col space-y-1">
        {label && (
          <Label
            htmlFor={inputId}
            className={cn('leading-none', error ? 'text-red-500' : 'text-gray-900')}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={effectiveType}
            className={cn(
              inputVariants({ variant: inputVariant, size, className }),
              leftIcon && 'pl-10',
              // (rightIcon || type === 'password') && 'pr-10'
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && !passwordToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {rightIcon}
            </div>
          )}
          {/* {helpText &&!rightIcon && !passwordToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent align='end' alignOffset={-4}>
                  <TooltipArrow />
                  {helpText}
                </TooltipContent>
              </Tooltip>
            </div>
          )} */}

          {passwordToggle}
        </div>

        {helpText && !error && (
          <p className="-mt-2 mb-2 text-xs text-gray-400">{helpText}</p>
        )}
        {error && (
          <p className="mb-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
