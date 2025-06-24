'use client';

import * as React from 'react';

import { Input } from '@/components/atoms/input/input';
import { Select } from '@/components/atoms/select/select';
import { Textarea } from '@/components/atoms/textarea/textarea';
import { cn } from '@/lib/utils/ui';

interface MobileFormFieldProps {
  type: 'input' | 'select' | 'textarea';
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const MobileFormField: React.FC<MobileFormFieldProps> = ({
  type,
  label,
  value,
  onChange,
  placeholder,
  options = [],
  error,
  required = false,
  autoFocus = false,
  className,
}) => {
  const fieldId = React.useId();

  const baseProps = {
    id: fieldId,
    value,
    error,
    placeholder,
    required,
    autoFocus,
  };

  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <Select
            {...baseProps}
            options={options}
            onValueChange={onChange}
            className={cn('text-base', className)} // Prevent zoom on iOS
          />
        );
      case 'textarea':
        return (
          <Textarea
            {...baseProps}
            onChange={(e) => onChange(e.target.value)}
            className={cn('text-base min-h-[120px]', className)} // Prevent zoom on iOS
          />
        );
      default:
        return (
          <Input
            {...baseProps}
            onChange={(e) => onChange(e.target.value)}
            className={cn('text-base', className)} // Prevent zoom on iOS
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className={cn(
          'block text-sm font-medium text-gray-700',
          error && 'text-red-500'
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
    </div>
  );
};
