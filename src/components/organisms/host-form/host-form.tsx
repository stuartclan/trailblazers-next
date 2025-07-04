'use client';

import * as React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { Alert } from '@/components/atoms/alert/alert';
import { Button } from '@/components/atoms/button/button';
import { Form } from '@/components/atoms/form/form';
import { FormControl } from '@/components/atoms/form-control/form-control';
import { Input } from '@/components/atoms/input/input';
import { Label } from '@/components/atoms/label/label';
import { Textarea } from '@/components/atoms/textarea/textarea';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { useToastNotifications } from '@/hooks/useToast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define host form schema
const hostSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().readonly(),
  // email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional()
    .or(z.literal('')),
  adminPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  disclaimer: z.string().optional(),
});

type HostFormValues = z.infer<typeof hostSchema>;

interface HostFormProps {
  onSubmit: (data: HostFormValues) => Promise<void>;
  defaultValues?: Partial<HostFormValues>;
  isEdit?: boolean;
  onCancel?: () => void;
}

/**
 * Host registration/edit form component with comprehensive toast integration and mobile support
 */
export const HostForm: React.FC<HostFormProps> = ({
  onSubmit,
  defaultValues,
  isEdit = false,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // const [isMobile, setIsMobile] = React.useState(false);
  const { success, error, info } = useToastNotifications();

  // Check if we're on mobile
  // React.useEffect(() => {
  //   const checkMobile = () => {
  //     setIsMobile(window.innerWidth < 768);
  //   };

  //   checkMobile();
  //   window.addEventListener('resize', checkMobile);
  //   return () => window.removeEventListener('resize', checkMobile);
  // }, []);

  const form = useForm<HostFormValues>({
    resolver: zodResolver(hostSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      password: defaultValues?.password || '',
      adminPassword: !isEdit ? defaultValues?.adminPassword || '' : '',
      disclaimer: defaultValues?.disclaimer || '',
    },
  });

  // const { watch, setValue, reset } = form;
  const { reset } = form;

  // Enhanced form submission with comprehensive toast feedback
  const handleSubmit = async (data: HostFormValues) => {
    setIsSubmitting(true);

    // // Show initial progress toast
    // const action = isEdit ? 'Updating' : 'Creating';
    // const progressToastId = info(
    //   `${action} host configuration...`,
    //   `Host ${isEdit ? 'Update' : 'Creation'}`
    // );

    try {
      // // Validate password strength visually for user
      // if (!isEdit || data.password) {
      //   info('Validating password requirements...', 'Validation');
      // }

      // Show data validation step
      info('Validating form data...', 'Validation');

      // Call the submission handler
      await onSubmit(data);

      // Show detailed success toast with next steps
      const successAction = isEdit ? 'updated' : 'created';
      success(
        `Host "${data.name}" has been ${successAction} successfully! ${isEdit
          ? 'Changes are now active.'
          : 'You can now login with your credentials.'
        }`,
        `Host ${isEdit ? 'Updated' : 'Created'}`
      );

      // Reset form only for new host creation
      if (!isEdit) {
        reset();
        info('Form has been reset for next entry', 'Ready for Next Host');
      } else {
        info('Host configuration updated', 'Settings Applied');
      }

    } catch (err) {
      console.error('Host form submission error:', err);

      // Provide specific error messaging based on error type
      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} host`;
      let errorTitle = `Host ${isEdit ? 'Update' : 'Creation'} Failed`;

      if (err instanceof Error) {
        if (err.message === 'Cognito user exists') {
          errorMessage = 'Email address is already associated with a host';
          errorTitle = 'Email exists';
        } else if (err.message.includes('email')) {
          errorMessage = 'Email address is already in use or invalid';
          errorTitle = 'Email Conflict';
        } else if (err.message.includes('password')) {
          errorMessage = 'Password does not meet security requirements';
          errorTitle = 'Password Error';
        } else if (err.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again';
          errorTitle = 'Connection Error';
        } else {
          errorMessage = err.message;
        }
      }

      error(errorMessage, errorTitle);

      // Provide recovery suggestions
      setTimeout(() => {
        info(
          'Please review your information and try again. Contact support if the problem persists.',
          'Next Steps'
        );
      }, 2000);

    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced reset handler with toast feedback
  const handleReset = () => {
    reset();
    info('Form has been reset to default values', 'Form Reset');
  };

  // Enhanced cancel handler
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    info('Form editing cancelled', 'Cancelled');
  };

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit(handleSubmit)}
        isSubmitting={isSubmitting}
        className="space-y-6"
      >
        {/* TODO: Fix this error handling */}
        {/* {form.formState?.errors && (
          <Alert variant='error' title='There were errors with your submission'>
            {form.formState?.errors?.name?.message}
            {form.formState?.errors?.email?.message}
            {form.formState?.errors?.password?.message}
            {form.formState?.errors?.disclaimer?.message}
          </Alert>
        )} */}

        {/* Host Name */}
        <FormControl
          name="name"
          label="Host name"
          // helpText="The name of the organization or business"
          render={(fieldProps) => (
            <Input
              {...fieldProps}
              type='text'
              placeholder="Enter host name"
              disabled={isSubmitting}
              required
            />
          )}
        />

        {/* Email */}
        {!isEdit ? (
          <FormControl
            name="email"
            label="Email"
            // helpText="This email will be used for login"
            render={(fieldProps) => (
              <Input
                {...fieldProps}
                type="email"
                description='The email address that will be used to log into the check-in app'
                placeholder="Enter email address"
                // readOnly={isEdit}
                // disabled={isEdit || isSubmitting}
                disabled={isSubmitting}
                required
              />
            )}
          />
        ) : (
          <div className="text-sm text-gray-500">
            <Label>Email</Label>
            <Alert variant='default'>
              <span className='text-gray-500'>If you need to change the email address associated with the host, please contact Club Trailblazers.</span>
            </Alert>
          </div>
        )}

        {/* Password */}
        {!isEdit && (
          <FormControl
            name="password"
            label="Check-in password"
            render={(fieldProps) => (
              <Input
                {...fieldProps}
                type="password"
                helpText="At least 8 characters with uppercase, lowercase, and number. This is the password to log into a device for the host."
                disabled={isSubmitting}
              />
            )}
          />
        )}

        {/* Admin Password */}
        <FormControl
          name="adminPassword"
          label="Admin password"
          // helpText="This is the shared password to access the admin dashboard"
          render={(fieldProps) => (
            <Input
              {...fieldProps}
              type="password"
              helpText='This is the shared password to access the admin dashboard for rewards'
              placeholder={isEdit ? "Enter new admin password (leave blank to keep current)" : "Enter admin password"}
              disabled={isSubmitting}
            />
          )}
        />

        {/* Disclaimer */}
        <FormControl
          name="disclaimer"
          label="Disclaimer text"
          // helpText="This text will be shown to athletes during registration or their first check-in"
          render={(fieldProps) => (
            <Textarea
              {...fieldProps}
              description="This text will be shown to athletes during registration or their first check-in at this host. This form accepts <a href='https://www.markdownguide.org/cheat-sheet/' target='_blank'>Markdown</a> for formatting."
              placeholder="Enter disclaimer text"
              rows={5}
              disabled={isSubmitting}
            />
          )}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
          {onCancel && (
            <TouchTarget>
              <Button
                variant="ghost"
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </TouchTarget>
          )}

          <TouchTarget>
            <Button
              variant="outline"
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset Form
            </Button>
          </TouchTarget>

          <TouchTarget>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isEdit
                ? (isSubmitting ? 'Updating Host...' : 'Update Host')
                : (isSubmitting ? 'Creating Host...' : 'Create Host')
              }
            </Button>
          </TouchTarget>
        </div>

        {/* Progress indicator for long operations */}
        {isSubmitting && (
          <div className="mt-4 p-4 bg-blue-50 border-1 border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <div className="text-sm text-blue-700">
                <p className="font-medium">
                  {isEdit ? 'Updating host configuration...' : 'Creating new host...'}
                </p>
                <p className="text-blue-600">
                  Please wait while we process your request.
                </p>
              </div>
            </div>
          </div>
        )}
      </Form>
    </FormProvider>
  );
};
