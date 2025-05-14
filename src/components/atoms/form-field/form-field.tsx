'use client';

import * as React from 'react';

import { Label } from '../label/label';
import { cn } from '@/lib/utils/ui';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  labelFor?: string;
  required?: boolean;
  error?: string;
  description?: string;
  horizontal?: boolean;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ 
    className, 
    label, 
    labelFor, 
    required, 
    error, 
    description, 
    horizontal = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          'form-field', 
          horizontal ? 'sm:flex sm:items-start sm:gap-4' : 'space-y-2',
          className
        )} 
        {...props}
      >
        {label && (
          <div className={horizontal ? 'sm:w-1/3 sm:pt-1' : ''}>
            <Label 
              htmlFor={labelFor} 
              required={required}
              className="inline-block"
            >
              {label}
            </Label>
            {description && (
              <div className="mt-1 text-xs text-gray-500">
                {description}
              </div>
            )}
          </div>
        )}
        <div className={horizontal ? 'sm:w-2/3' : ''}>
          {children}
          {error && !horizontal && (
            <div className="mt-1 text-sm text-red-500">{error}</div>
          )}
        </div>
        {error && horizontal && (
          <div className="mt-1 text-sm text-red-500 sm:ml-1/3">{error}</div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField };