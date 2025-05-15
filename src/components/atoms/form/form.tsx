'use client';

import * as React from 'react';

import { cn } from '@/lib/utils/ui';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /**
   * Success message to display when form is successfully submitted
   */
  successMessage?: string | null;
  /**
   * Error message to display when form submission fails
   */
  errorMessage?: string | null;
  /**
   * Whether the form is currently submitting
   */
  isSubmitting?: boolean;
  /**
   * Whether the form is currently in a success state
   */
  isSuccess?: boolean;
}

/**
 * Form component with built-in support for success and error messages
 */
const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ 
    className, 
    children, 
    successMessage, 
    errorMessage, 
    isSubmitting,
    isSuccess,
    ...props 
  }, ref) => {
    return (
      <form
        ref={ref}
        className={cn('space-y-6', className)}
        {...props}
      >
        {isSuccess && successMessage && (
          <div className="rounded-md bg-green-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className={cn(isSubmitting && 'opacity-70 pointer-events-none')}>
          {children}
        </div>
      </form>
    );
  }
);

Form.displayName = 'Form';

export { Form };