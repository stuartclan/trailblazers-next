'use client';

import * as React from 'react';

import { Controller, ControllerProps, FieldPath, FieldValues, useFormContext } from 'react-hook-form';

/**
 * Props for the FormControl component
 */
export type FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
  label?: string;
  helpText?: string;
} & Omit<ControllerProps<TFieldValues, TName>, 'render'> & {
  render: (props: {
    field: ReturnType<NonNullable<ControllerProps<TFieldValues, TName>['render']>>;
    fieldState: {
      invalid: boolean;
      isTouched: boolean;
      isDirty: boolean;
      error?: {
        type: string;
        message: string;
      };
    };
    formState: {
      isSubmitting: boolean;
      isSubmitted: boolean;
    };
    label?: string;
    helpText?: string;
    error?: string;
  }) => React.ReactElement;
};

/**
 * A wrapper component for form controls that integrates with React Hook Form
 */
export function FormControl<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  label,
  helpText,
  render,
  ...props
}: FormControlProps<TFieldValues, TName>) {
  const formContext = useFormContext<TFieldValues>();
  const resolvedControl = control || formContext?.control;

  if (!resolvedControl) {
    throw new Error(
      'FormControl must be used within a FormProvider or be passed a control prop'
    );
  }

  return (
    <Controller
      name={name}
      control={resolvedControl}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => 
        render({
          ...field,
          // fieldState,
          // ...field,
          label,
          helpText,
          error: fieldState.error?.message,
        })
      }
      {...props}
    />
  );
}

/**
 * Hook to access form context with error handling
 */
export function useFormController() {
  const context = useFormContext();
  
  if (!context) {
    throw new Error('useFormController must be used within a FormProvider');
  }
  
  return context;
}

/**
 * Hook to easily get a field's error message
 */
export function useFieldError(name: string) {
  const { formState: { errors } } = useFormController();
  const error = name.split('.').reduce((acc, part) => acc?.[part], errors);
  return error?.message as string | undefined;
}