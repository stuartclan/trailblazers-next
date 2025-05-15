'use client';

import * as React from 'react';

import { Label } from '../label/label';
import { cn } from '@/lib/utils/ui';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Field label
   */
  label?: string;
  /**
   * ID of the input element this label is for
   */
  labelFor?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Help text to display below the field
   */
  helpText?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Whether to display the label and field horizontally
   */
  horizontal?: boolean;
}

/**
 * A form field container that includes a label, help text, and error message
 */
const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ 
    className, 
    children, 
    label, 
    labelFor, 
    required, 
    helpText, 
    error, 
    horizontal = false,
    ...props 
  }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          'form-field mb-4',
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
              className={cn(
                "block text-sm font-medium",
                error ? "text-red-500" : "text-gray-700"
              )}
            >
              {label}
            </Label>
            
            {helpText && horizontal && (
              <p className="mt-1 text-xs text-gray-500">
                {helpText}
              </p>
            )}
          </div>
        )}
        
        <div className={horizontal ? 'sm:w-2/3' : ''}>
          {children}
          
          {helpText && !horizontal && !error && (
            <p className="mt-1 text-xs text-gray-500">
              {helpText}
            </p>
          )}
          
          {error && !horizontal && (
            <p className="mt-1 text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
        
        {error && horizontal && (
          <div className="mt-1 sm:ml-1/3">
            <p className="text-sm text-red-500">
              {error}
            </p>
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField };