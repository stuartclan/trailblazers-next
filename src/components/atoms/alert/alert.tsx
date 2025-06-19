'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/ui';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

const alertVariants = cva(
  'alert relative rounded-lg border-1 p-4',
  {
    variants: {
      variant: {
        default: 'bg-white text-gray-900 border-gray-200',
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        success: 'bg-green-50 text-green-800 border-green-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        error: 'bg-red-50 text-red-800 border-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
  title?: string;
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, title, onClose, children, ...props }, ref) => {
    // Default icons based on variant
    const getDefaultIcon = () => {
      if (icon) return icon;
      
      switch (variant) {
        case 'info':
          return <Info className="h-5 w-5" />;
        case 'success':
          return <CheckCircle className="h-5 w-5" />;
        case 'warning':
          return <AlertCircle className="h-5 w-5" />;
        case 'error':
          return <XCircle className="h-5 w-5" />;
        default:
          return null;
      }
    };
    
    return (
      <div
        ref={ref}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <div className="flex">
          {getDefaultIcon() && (
            <div className="flex-shrink-0 mr-3">
              {getDefaultIcon()}
            </div>
          )}
          <div className="flex-1">
            {title && (
              <h3 className="text-sm font-medium mb-1">{title}</h3>
            )}
            <div className="text-sm">{children}</div>
          </div>
          {onClose && (
            <button
              type="button"
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={onClose}
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert };