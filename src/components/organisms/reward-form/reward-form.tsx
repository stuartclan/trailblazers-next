// src/components/organisms/reward-form/reward-form.tsx
'use client';

import * as React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@/components/atoms/button/button';
import { Form } from '@/components/atoms/form/form';
import { FormControl } from '@/components/atoms/form-control/form-control';
import { IconPicker } from '@/components/molecules/icon-picker/icon-picker';
import { Input } from '@/components/atoms/input/input';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { useToastNotifications } from '@/hooks/useToast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define reward form schema
const rewardSchema = z.object({
  count: z.string().transform(val => parseInt(val, 10))
    .pipe(
      z.number()
        .min(1, 'Check-in count must be at least 1')
        .max(999, 'Check-in count must be less than 1000')
    ),
  // .min(1, 'Check-in count must be at least 1')
  // .max(999, 'Check-in count must be less than 1000'),
  name: z.string()
    .min(1, 'Reward name is required')
    .max(50, 'Reward name must be less than 50 characters'),
  icon: z.string()
    .min(1, 'Please select an icon for this reward'),
});

type RewardFormValues = z.infer<typeof rewardSchema>;

interface RewardFormProps {
  onSubmit: (data: RewardFormValues) => Promise<void>;
  defaultValues?: Partial<RewardFormValues>;
  isEdit?: boolean;
  onCancel?: () => void;
}

/**
 * Reward creation/edit form component with comprehensive toast integration
 */
const RewardForm: React.FC<RewardFormProps> = ({
  onSubmit,
  defaultValues,
  isEdit = false,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { success, error, info } = useToastNotifications();

  const form = useForm<RewardFormValues>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      count: defaultValues?.count || 8,
      name: defaultValues?.name || '',
      icon: defaultValues?.icon || '',
    },
  });

  const { reset } = form;

  // Enhanced form submission with comprehensive toast feedback
  const handleSubmit = async (data: RewardFormValues) => {
    setIsSubmitting(true);

    // Show initial progress toast
    const action = isEdit ? 'Updating' : 'Creating';
    info(
      `${action} reward configuration...`,
      `Reward ${isEdit ? 'Update' : 'Creation'}`
    );

    try {
      // Show data validation step
      info('Validating reward data...', 'Validation');

      // Call the submission handler
      await onSubmit(data);

      // Show detailed success toast with next steps
      const successAction = isEdit ? 'updated' : 'created';
      success(
        `Reward "${data.name}" has been ${successAction} successfully! ${isEdit
          ? 'Changes are now active for all athletes.'
          : `Athletes will now earn this reward after ${data.count} check-ins across all host locations.`
        }`,
        `Reward ${isEdit ? 'Updated' : 'Created'}`
      );

      // Reset form only for new reward creation
      if (!isEdit) {
        reset();
        info('Form has been reset for next entry', 'Ready for Next Reward');
      } else {
        info('Reward configuration updated', 'Settings Applied');
      }

    } catch (err) {
      console.error('Reward form submission error:', err);

      // Provide specific error messaging based on error type
      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} reward`;
      let errorTitle = `Reward ${isEdit ? 'Update' : 'Creation'} Failed`;

      if (err instanceof Error) {
        if (err.message.includes('name')) {
          errorMessage = 'Reward name is already in use or invalid';
          errorTitle = 'Name Conflict';
        } else if (err.message.includes('count')) {
          errorMessage = 'Check-in count must be between 1 and 999';
          errorTitle = 'Invalid Count';
        } else if (err.message.includes('icon')) {
          errorMessage = 'Selected icon is invalid or unavailable';
          errorTitle = 'Icon Error';
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
    // info('Form editing cancelled', 'Cancelled');
  };

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit(handleSubmit)}
        isSubmitting={isSubmitting}
        className="space-y-6"
      >
        {/* Reward Name */}
        <FormControl
          name="name"
          label="Reward name"
          render={(fieldProps) => (
            <Input
              {...fieldProps}
              type='text'
              placeholder="Enter reward name (e.g., 'Tier 1 Reward', 'Bronze Medal')"
              disabled={isSubmitting}
              required
            />
          )}
        />

        {/* Check-in Count */}
        <FormControl
          name="count"
          label="Check-ins required"
          helpText="Athletes will earn this reward after completing this many check-ins across all host locations"
          render={(fieldProps) => (
            <Input
              {...fieldProps}
              type='number'
              min={1}
              max={999}
              placeholder="Enter number of check-ins required"
              disabled={isSubmitting}
              required
            />
          )}
        />

        {/* Icon Selection */}
        <FormControl
          name="icon"
          label="Reward icon"
          render={(props) => (
            <IconPicker
              value={props.value}
              onChange={props.onChange}
              error={props.error}
              placeholder="Choose an icon that represents this reward"
              variant="reward"
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
                ? (isSubmitting ? 'Updating Reward...' : 'Update Reward')
                : (isSubmitting ? 'Creating Reward...' : 'Create Reward')
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
                  {isEdit ? 'Updating reward configuration...' : 'Creating new reward...'}
                </p>
                <p className="text-blue-600">
                  Please wait while we process your request.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Help */}
        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Reward Creation Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use clear, motivating names that athletes will be excited to earn</li>
            <li>• Set realistic check-in requirements that encourage regular participation</li>
            <li>• Choose icons that visually represent the reward or achievement level</li>
            <li>• Consider creating a progression of rewards (e.g., 8, 30, 60 check-ins)</li>
            <li>• Global rewards are earned through check-ins at any host location</li>
          </ul>
        </div>
      </Form>
    </FormProvider>
  );
};

RewardForm.displayName = 'RewardForm';

export { RewardForm };
