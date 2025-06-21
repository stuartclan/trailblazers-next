// src/components/molecules/activity-form/activity-form.tsx
'use client';

import * as React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@/components/atoms/button/button';
import { Form } from '@/components/atoms/form/form';
import { FormControl } from '@/components/atoms/form-control/form-control';
import { IconPicker } from '@/components/molecules/icon-picker/icon-picker';
import { Input } from '@/components/atoms/input/input';
import { Switch } from '@/components/atoms/switch/switch';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { useToastNotifications } from '@/hooks/useToast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define activity form schema
const activitySchema = z.object({
    name: z.string()
        .min(2, 'Activity name must be at least 2 characters')
        .max(50, 'Activity name must be less than 50 characters'),
    icon: z.string()
        .min(1, 'Please select an icon for this activity'),
    enabled: z.boolean().default(true).optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityFormProps {
    onSubmit: (data: ActivityFormValues) => Promise<void>;
    defaultValues?: Partial<ActivityFormValues>;
    isEdit?: boolean;
    onCancel?: () => void;
}

/**
 * Activity creation/edit form component with comprehensive toast integration
 */
export const ActivityForm: React.FC<ActivityFormProps> = ({
    onSubmit,
    defaultValues,
    isEdit = false,
    onCancel,
}) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { success, error, info } = useToastNotifications();

    const form = useForm<ActivityFormValues>({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            name: defaultValues?.name || '',
            icon: defaultValues?.icon || '',
            enabled: defaultValues?.enabled !== undefined ? defaultValues.enabled : true,
        },
    });

    const { reset } = form;

    // Enhanced form submission with comprehensive toast feedback
    const handleSubmit = async (data: ActivityFormValues) => {
        setIsSubmitting(true);

        // Show initial progress toast
        const action = isEdit ? 'Updating' : 'Creating';
        info(
            `${action} activity configuration...`,
            `Activity ${isEdit ? 'Update' : 'Creation'}`
        );

        try {
            // Show data validation step
            info('Validating activity data...', 'Validation');

            // Call the submission handler
            await onSubmit(data);

            // Show detailed success toast with next steps
            const successAction = isEdit ? 'updated' : 'created';
            success(
                `Activity "${data.name}" has been ${successAction} successfully! ${isEdit
                    ? 'Changes are now active across all locations.'
                    : 'You can now assign this activity to locations.'
                }`,
                `Activity ${isEdit ? 'Updated' : 'Created'}`
            );

            // Reset form only for new activity creation
            if (!isEdit) {
                reset();
                info('Form has been reset for next entry', 'Ready for Next Activity');
            } else {
                info('Activity configuration updated', 'Settings Applied');
            }

        } catch (err) {
            console.error('Activity form submission error:', err);

            // Provide specific error messaging based on error type
            let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} activity`;
            let errorTitle = `Activity ${isEdit ? 'Update' : 'Creation'} Failed`;

            if (err instanceof Error) {
                if (err.message.includes('name')) {
                    errorMessage = 'Activity name is already in use or invalid';
                    errorTitle = 'Name Conflict';
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
        info('Form editing cancelled', 'Cancelled');
    };

    return (
        <FormProvider {...form}>
            <Form
                onSubmit={form.handleSubmit(handleSubmit)}
                isSubmitting={isSubmitting}
                className="space-y-6"
            >
                {/* Activity Name */}
                <FormControl
                    name="name"
                    label="Activity name"
                    render={(fieldProps) => (
                        <Input
                            {...fieldProps}
                            type='text'
                            placeholder="Enter activity name (e.g., Cycling, Running, Swimming)"
                            disabled={isSubmitting}
                            required
                        />
                    )}
                />

                {/* Icon Selection */}
                <FormControl
                    name="icon"
                    label="Activity icon"
                    render={(props) => (
                        <IconPicker
                            value={props.value}
                            onChange={props.onChange}
                            error={props.error}
                            placeholder="Choose an icon that represents this activity"
                        />
                    )}
                />

                {/* Enabled Toggle */}
                <FormControl
                    name="enabled"
                    render={(props) => (
                        <Switch
                            checked={props.value}
                            onCheckedChange={props.onChange}
                            label="Enable activity"
                            helpText="When enabled, this activity will be available for location assignment"
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
                                ? (isSubmitting ? 'Updating Activity...' : 'Update Activity')
                                : (isSubmitting ? 'Creating Activity...' : 'Create Activity')
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
                                    {isEdit ? 'Updating activity configuration...' : 'Creating new activity...'}
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
