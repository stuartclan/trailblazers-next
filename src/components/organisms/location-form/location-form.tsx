'use client';

import * as React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@/components/atoms/button/button';
import { Form } from '@/components/atoms/form/form';
import { FormControl } from '@/components/atoms/form-control/form-control';
import { Input } from '@/components/atoms/input/input';
import { Textarea } from '@/components/atoms/textarea/textarea';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { useToastNotifications } from '@/hooks/useToast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define location form schema
const locationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters').optional().or(z.literal('')),
    // hostId: z.string().min(1, 'Please select a host'),
});

type LocationFormValues = z.infer<typeof locationSchema>;

// interface HostOption {
//     value: string;
//     label: string;
// }

interface LocationFormProps {
    onSubmit: (data: LocationFormValues) => Promise<void>;
    defaultValues?: Partial<LocationFormValues>;
    // hosts: HostOption[];
    isEdit?: boolean;
    onCancel?: () => void;
}

/**
 * Location registration/edit form component with comprehensive toast integration
 */
export const LocationForm: React.FC<LocationFormProps> = ({
    onSubmit,
    defaultValues,
    // hosts = [],
    isEdit = false,
    onCancel,
}) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { success, error, info } = useToastNotifications();

    const form = useForm<LocationFormValues>({
        resolver: zodResolver(locationSchema),
        defaultValues: {
            name: defaultValues?.name || '',
            address: defaultValues?.address || '',
            // hostId: defaultValues?.hostId || '',
        },
    });

    const { watch, setValue, reset } = form;

    // Enhanced form submission with comprehensive toast feedback
    const handleSubmit = async (data: LocationFormValues) => {
        setIsSubmitting(true);

        // Show initial progress toast
        const action = isEdit ? 'Updating' : 'Creating';
        info(
            `${action} location configuration...`,
            `Location ${isEdit ? 'Update' : 'Creation'}`
        );

        try {
            // Show data validation step
            info('Validating location data...', 'Validation');

            // Call the submission handler
            await onSubmit(data);

            // Show detailed success toast with next steps
            const successAction = isEdit ? 'updated' : 'created';
            success(
                `Location "${data.name}" has been ${successAction} successfully! ${isEdit
                    ? 'Changes are now active.'
                    : 'You can now assign activities to this location.'
                }`,
                `Location ${isEdit ? 'Updated' : 'Created'}`
            );

            // Reset form only for new location creation
            if (!isEdit) {
                reset();
                info('Form has been reset for next entry', 'Ready for Next Location');
            } else {
                info('Location configuration updated', 'Settings Applied');
            }

        } catch (err) {
            console.error('Location form submission error:', err);

            // Provide specific error messaging based on error type
            let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} location`;
            let errorTitle = `Location ${isEdit ? 'Update' : 'Creation'} Failed`;

            if (err instanceof Error) {
                // if (err.message.includes('host')) {
                //     errorMessage = 'Selected host is invalid or no longer exists';
                //     errorTitle = 'Host Error';
                // } else if (err.message.includes('name')) {
                if (err.message.includes('name')) {
                    errorMessage = 'Location name is already in use or invalid';
                    errorTitle = 'Name Conflict';
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
                {/* Location Name */}
                <FormControl
                    name="name"
                    label="Location name"
                    render={(fieldProps) => (
                        <Input
                            {...fieldProps}
                            type='text'
                            placeholder="Enter location name"
                            disabled={isSubmitting}
                            required
                        />
                    )}
                />

                {/* Host Selection */}
                {/* <FormControl
                    name="hostId"
                    label="Host"
                    render={(fieldProps) => (
                        <Select
                            {...fieldProps}
                            options={hosts}
                            placeholder="Select a host"
                            disabled={isSubmitting || isEdit} // Don't allow changing host for existing locations
                            required
                        />
                    )}
                /> */}

                {/* {isEdit && (
                    <div className="text-sm text-gray-500">
                        <span className="text-gray-600">
                            Note: Host cannot be changed for existing locations. Create a new location if you need to assign it to a different host.
                        </span>
                    </div>
                )} */}

                {/* Address */}
                <FormControl
                    name="address"
                    label="Address"
                    render={(fieldProps) => (
                        <Textarea
                            {...fieldProps}
                            placeholder="Enter the complete address for this location"
                            rows={3}
                            disabled={isSubmitting}
                        // required
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
                                ? (isSubmitting ? 'Updating Location...' : 'Update Location')
                                : (isSubmitting ? 'Creating Location...' : 'Create Location')
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
                                    {isEdit ? 'Updating location configuration...' : 'Creating new location...'}
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
