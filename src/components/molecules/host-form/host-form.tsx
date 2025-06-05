'use client';

import * as React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@/components/atoms/button/button';
import { Form } from '@/components/atoms/form/form';
import { FormControl } from '@/components/atoms/form-control/form-control';
import { Input } from '@/components/atoms/input/input';
import { Textarea } from '@/components/atoms/textarea/textarea';
import { useToastNotifications } from '@/hooks/useToast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define host form schema
const hostSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  passwordConfirm: z.string(),
  disclaimer: z.string().optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ['passwordConfirm'],
});

type HostFormValues = z.infer<typeof hostSchema>;

interface HostFormProps {
  onSubmit: (data: HostFormValues) => Promise<void>;
  defaultValues?: Partial<HostFormValues>;
  isEdit?: boolean;
}

/**
 * Host registration/edit form component
 */
export const HostForm: React.FC<HostFormProps> = ({
  onSubmit,
  defaultValues,
  isEdit = false,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { success, error, info } = useToastNotifications();

  const methods = useForm<HostFormValues>({
    resolver: zodResolver(hostSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      password: defaultValues?.password || '',
      passwordConfirm: defaultValues?.password || '',
      disclaimer: defaultValues?.disclaimer || '',
    },
  });

  const handleSubmit = async (data: HostFormValues) => {
    setIsSubmitting(true);

    // Show progress toast
    const action = isEdit ? 'Updating' : 'Creating';
    info(`${action} host configuration...`, `Host ${isEdit ? 'Update' : 'Creation'}`);

    try {
      await onSubmit(data);
      
      // Show success toast
      const successAction = isEdit ? 'updated' : 'created';
      success(
        `Host "${data.name}" has been ${successAction} successfully!`,
        `Host ${isEdit ? 'Updated' : 'Created'}`
      );

      if (!isEdit) {
        methods.reset();
      }
    } catch (err) {
      console.error('Host form submission error:', err);
      const errorMessage = err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'create'} host`;
      error(errorMessage, `Host ${isEdit ? 'Update' : 'Creation'} Failed`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form
        onSubmit={methods.handleSubmit(handleSubmit)}
        isSubmitting={isSubmitting}
      >
        {/* Host Name */}
        <FormControl
          name="name"
          label="Host Name"
          helpText="The name of the organization or business"
          render={({ field, error }) => (
            <Input
              {...field}
              type='text'
              error={error}
              placeholder="Enter host name"
              disabled={isSubmitting}
            />
          )}
        />

        {/* Email */}
        <FormControl
          name="email"
          label="Email"
          helpText="This email will be used for login"
          render={({ field, error }) => (
            <Input
              {...field}
              type="email"
              error={error}
              placeholder="Enter email address"
              disabled={isEdit || isSubmitting}
            />
          )}
        />

        {/* Password */}
        <FormControl
          name="password"
          label={isEdit ? "New Password" : "Password"}
          helpText="At least 8 characters with uppercase, lowercase, and number"
          render={({ field, error }) => (
            <Input
              {...field}
              type="password"
              error={error}
              placeholder={isEdit ? "Enter new password (leave blank to keep current)" : "Enter password"}
              disabled={isSubmitting}
            />
          )}
        />

        {/* Confirm Password */}
        <FormControl
          name="passwordConfirm"
          label={isEdit ? "Confirm New Password" : "Confirm Password"}
          render={({ field, error }) => (
            <Input
              {...field}
              type="password"
              error={error}
              placeholder={isEdit ? "Confirm new password" : "Confirm password"}
              disabled={isSubmitting}
            />
          )}
        />

        {/* Disclaimer */}
        <FormControl
          name="disclaimer"
          label="Disclaimer Text"
          helpText="This text will be shown to athletes during registration"
          render={({ field, error }) => (
            <Textarea
              {...field}
              error={error}
              placeholder="Enter disclaimer text"
              rows={5}
              disabled={isSubmitting}
            />
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              methods.reset();
              info('Form has been reset', 'Form Reset');
            }}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isEdit 
              ? (isSubmitting ? 'Updating...' : 'Update Host')
              : (isSubmitting ? 'Creating...' : 'Create Host')
            }
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
};