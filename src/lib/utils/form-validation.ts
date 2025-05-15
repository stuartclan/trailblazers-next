/* eslint-disable @typescript-eslint/no-explicit-any */
// Common validation rules for form fields

// Email validation regex
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
// Phone validation regex (basic US format)
const PHONE_REGEX = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * Common validation rules that can be passed to React Hook Form
 */
export const validationRules = {
  /**
   * Required field validation with custom message
   */
  required: (message = 'This field is required') => ({
    required: { value: true, message }
  }),
  
  /**
   * Min length validation
   */
  minLength: (min: number, message?: string) => ({
    minLength: {
      value: min,
      message: message || `Must be at least ${min} characters`
    }
  }),
  
  /**
   * Max length validation
   */
  maxLength: (max: number, message?: string) => ({
    maxLength: {
      value: max,
      message: message || `Must be no more than ${max} characters`
    }
  }),
  
  /**
   * Email format validation
   */
  email: (message = 'Please enter a valid email address') => ({
    pattern: {
      value: EMAIL_REGEX,
      message
    }
  }),
  
  /**
   * Phone format validation
   */
  phone: (message = 'Please enter a valid phone number') => ({
    pattern: {
      value: PHONE_REGEX,
      message
    }
  }),
  
  /**
   * URL format validation
   */
  url: (message = 'Please enter a valid URL') => ({
    pattern: {
      value: URL_REGEX,
      message
    }
  }),
  
  /**
   * Min value validation (for numbers)
   */
  min: (min: number, message?: string) => ({
    min: {
      value: min,
      message: message || `Must be at least ${min}`
    }
  }),
  
  /**
   * Max value validation (for numbers)
   */
  max: (max: number, message?: string) => ({
    max: {
      value: max,
      message: message || `Must be no more than ${max}`
    }
  }),
  
  /**
   * Custom validation function
   */
  validate: (
    validateFn: (value: any) => boolean | string,
    message = 'Invalid value'
  ) => ({
    validate: (value: any) => validateFn(value) || message
  })
};

/**
 * Compose multiple validation rules into one object
 */
export const composeValidation = (...rules: Record<string, any>[]) => {
  return rules.reduce((acc, rule) => ({ ...acc, ...rule }), {});
};

/**
 * Helper to create common form field validation
 * 
 * @example
 * // Required email field with max length
 * const emailValidation = createValidation({
 *   isRequired: true,
 *   isEmail: true,
 *   maxLength: 100
 * });
 */
export const createValidation = ({
  isRequired = false,
  isEmail = false,
  isPhone = false,
  isUrl = false,
  minLength,
  maxLength,
  min,
  max,
  customValidation,
  messages = {}
}: {
  isRequired?: boolean;
  isEmail?: boolean;
  isPhone?: boolean;
  isUrl?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  customValidation?: (value: any) => boolean | string;
  messages?: Record<string, string>;
}) => {
  const rules: Record<string, any>[] = [];
  
  if (isRequired) {
    rules.push(validationRules.required(messages.required));
  }
  
  if (isEmail) {
    rules.push(validationRules.email(messages.email));
  }
  
  if (isPhone) {
    rules.push(validationRules.phone(messages.phone));
  }
  
  if (isUrl) {
    rules.push(validationRules.url(messages.url));
  }
  
  if (minLength !== undefined) {
    rules.push(validationRules.minLength(minLength, messages.minLength));
  }
  
  if (maxLength !== undefined) {
    rules.push(validationRules.maxLength(maxLength, messages.maxLength));
  }
  
  if (min !== undefined) {
    rules.push(validationRules.min(min, messages.min));
  }
  
  if (max !== undefined) {
    rules.push(validationRules.max(max, messages.max));
  }
  
  if (customValidation) {
    rules.push(validationRules.validate(customValidation, messages.custom));
  }
  
  return composeValidation(...rules);
};