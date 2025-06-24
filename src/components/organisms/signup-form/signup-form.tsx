'use client';

import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { FormProvider, useForm } from 'react-hook-form';
import { HeartIcon, PawPrintIcon, ShieldIcon, UserIcon } from 'lucide-react';

import { Button } from '@/components/atoms/button/button';
import { Checkbox } from '@/components/atoms/checkbox/checkbox';
import { Form } from '@/components/atoms/form/form';
import { FormControl } from '@/components/atoms/form-control/form-control';
import { Input } from '@/components/atoms/input/input';
import { MobileFormField } from '@/components/molecules/mobile-form-field/mobile-form-field';
import { Select } from '@/components/atoms/select/select';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { useToastNotifications } from '@/hooks/useToast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const athleteSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    middleInitial: z.string().max(1, 'Only one letter allowed').optional(),
    email: z.string().email('Please enter a valid email address'),
    employer: z.string().max(100, 'Employer name too long').optional(),
    shirtGender: z.string().optional(),
    shirtSize: z.string().optional(),
    emergencyName: z.string().min(1, 'Emergency contact name is required'),
    emergencyPhone: z.string()
        .min(10, 'Phone number must be at least 10 digits')
        .regex(/^[\d\s\-\(\)\+\.]+$/, 'Please enter a valid phone number'),

    // Pet information
    hasPet: z.boolean().default(false).optional(),
    petName: z.string().optional(),

    // Disclaimer
    disclaimerAccepted: z.boolean().refine(val => val === true, {
        message: 'You must accept the disclaimer to register'
    })
}).refine((data) => {
    if (data.hasPet && !data.petName?.trim()) {
        return false;
    }
    return true;
}, {
    message: "Pet name is required when registering a pet",
    path: ["petName"]
});

type AthleteFormValues = z.infer<typeof athleteSchema>;

interface SignupFormProps {
    onSubmit: (data: AthleteFormValues) => Promise<void>;
    defaultValues?: Partial<AthleteFormValues>;
    disclaimerText?: string;
    onCancel?: () => void;
}

/**
 * Athlete registration form component with comprehensive toast integration and mobile support
 */
export const SignupForm: React.FC<SignupFormProps> = ({
    onSubmit,
    defaultValues,
    disclaimerText,
    onCancel,
}) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);
    const { success, error, info } = useToastNotifications();

    // Check if we're on mobile
    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const form = useForm<AthleteFormValues>({
        resolver: zodResolver(athleteSchema),
        defaultValues: {
            firstName: defaultValues?.firstName || '',
            lastName: defaultValues?.lastName || '',
            middleInitial: defaultValues?.middleInitial || '',
            email: defaultValues?.email || '',
            employer: defaultValues?.employer || '',
            shirtGender: defaultValues?.shirtGender || '',
            shirtSize: defaultValues?.shirtSize || '',
            emergencyName: defaultValues?.emergencyName || '',
            emergencyPhone: defaultValues?.emergencyPhone || '',
            hasPet: defaultValues?.hasPet || false,
            petName: defaultValues?.petName || '',
            disclaimerAccepted: defaultValues?.disclaimerAccepted || false,
        },
    });

    const { watch, setValue, reset } = form;
    const hasPet = watch('hasPet');

    // Enhanced form submission with comprehensive toast feedback
    const handleSubmit = async (data: AthleteFormValues) => {
        setIsSubmitting(true);

        // Show initial progress toast
        info('Creating athlete registration...', 'Registration');

        try {
            // Show data validation step
            info('Validating registration data...', 'Validation');

            // Call the submission handler
            await onSubmit(data);

            // Success message is handled by the parent component
            // since it includes athlete name and custom messaging

            // Reset form for potential next registration
            reset();
            info('Form has been reset for next registration', 'Ready for Next Athlete');

        } catch (err) {
            console.error('Signup form submission error:', err);

            // Provide specific error messaging based on error type
            let errorMessage = 'Failed to complete registration';
            let errorTitle = 'Registration Failed';

            if (err instanceof Error) {
                if (err.message.includes('email')) {
                    errorMessage = 'Email address is already registered or invalid';
                    errorTitle = 'Email Error';
                } else if (err.message.includes('disclaimer')) {
                    errorMessage = 'Disclaimer acceptance is required to register';
                    errorTitle = 'Disclaimer Required';
                } else if (err.message.includes('emergency')) {
                    errorMessage = 'Emergency contact information is required';
                    errorTitle = 'Emergency Contact Error';
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
        info('Registration cancelled', 'Cancelled');
    };

    const shirtGenderOptions = [
        { value: 'Mens', label: 'Mens' },
        { value: 'Womens', label: 'Womens' },
        { value: 'Kids', label: 'Kids' },
    ];

    const shirtSizeOptions = [
        { value: 'XS', label: 'XS - Extra Small' },
        { value: 'S', label: 'S - Small' },
        { value: 'M', label: 'M - Medium' },
        { value: 'L', label: 'L - Large' },
        { value: 'XL', label: 'XL - Extra Large' },
    ];

    // TODO: Cleanup Mobile fields; Add autocomplete off; autoCapitalize; etc
    return (
        <FormProvider {...form}>
            <Form
                onSubmit={form.handleSubmit(handleSubmit)}
                isSubmitting={isSubmitting}
            >
                {/* Personal Information */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                {isMobile ? (
                                    <MobileFormField
                                        type="input"
                                        label="First Name"
                                        value={watch('firstName')}
                                        onChange={(value) => setValue('firstName', value)}
                                        required
                                        error={form.formState.errors.firstName?.message}
                                    />
                                ) : (
                                    <FormControl
                                        name="firstName"
                                        label="First Name"
                                        render={(props) => (
                                            <Input
                                                {...props}
                                                required
                                            />
                                        )}
                                    />
                                )}
                            </div>

                            {isMobile ? (
                                <MobileFormField
                                    type="input"
                                    label="Middle Initial"
                                    value={watch('middleInitial') || ''}
                                    onChange={(value) => setValue('middleInitial', value)}
                                    error={form.formState.errors.middleInitial?.message}
                                />
                            ) : (
                                <FormControl
                                    name="middleInitial"
                                    label="Middle Initial"
                                    render={(props) => (
                                        <Input
                                            {...props}
                                            maxLength={1}
                                            placeholder='Optional'
                                        />
                                    )}
                                />
                            )}
                        </div>

                        {isMobile ? (
                            <MobileFormField
                                type="input"
                                label="Last Name"
                                value={watch('lastName')}
                                onChange={(value) => setValue('lastName', value)}
                                required
                                error={form.formState.errors.lastName?.message}
                            />
                        ) : (
                            <FormControl
                                name="lastName"
                                label="Last Name"
                                render={(props) => (
                                    <Input
                                        {...props}
                                        required
                                    />
                                )}
                            />
                        )}

                        {isMobile ? (
                            <MobileFormField
                                type="input"
                                label="Email Address"
                                value={watch('email')}
                                onChange={(value) => setValue('email', value)}
                                required
                                error={form.formState.errors.email?.message}
                            />
                        ) : (
                            <FormControl
                                name="email"
                                label="Email Address"
                                render={(props) => (
                                    <Input
                                        {...props}
                                        type="email"
                                        required
                                    />
                                )}
                            />
                        )}

                        {isMobile ? (
                            <MobileFormField
                                type="input"
                                label="Employer"
                                value={watch('employer') || ''}
                                onChange={(value) => setValue('employer', value)}
                                error={form.formState.errors.employer?.message}
                            />
                        ) : (
                            <FormControl
                                name="employer"
                                label="Employer"
                                render={(props) => (
                                    <Input
                                        {...props}
                                        placeholder="Optional"
                                    />
                                )}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* T-Shirt Information */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PawPrintIcon className="h-5 w-5 text-primary" />
                            T-Shirt Information (Optional)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isMobile ? (
                                <MobileFormField
                                    type="select"
                                    label="Shirt Style"
                                    value={watch('shirtGender') || ''}
                                    onChange={(value) => setValue('shirtGender', value)}
                                    options={shirtGenderOptions}
                                    error={form.formState.errors.shirtGender?.message}
                                    required
                                />
                            ) : (
                                <FormControl
                                    name="shirtGender"
                                    label="Shirt Style"
                                    render={(props) => (
                                        <Select
                                            label={props.label}
                                            options={shirtGenderOptions}
                                            value={props.value || ''}
                                            onValueChange={props.onChange}
                                            error={props.error}
                                            placeholder="Select shirt type"
                                            required
                                        />
                                    )}
                                />
                            )}

                            {isMobile ? (
                                <MobileFormField
                                    type="select"
                                    label="Shirt Size"
                                    value={watch('shirtSize') || ''}
                                    onChange={(value) => setValue('shirtSize', value)}
                                    options={shirtSizeOptions}
                                    error={form.formState.errors.shirtSize?.message}
                                    required
                                />
                            ) : (
                                <FormControl
                                    name="shirtSize"
                                    label="Shirt Size"
                                    render={(props) => (
                                        <Select
                                            label={props.label}
                                            options={shirtSizeOptions}
                                            value={props.value || ''}
                                            onValueChange={props.onChange}
                                            error={props.error}
                                            placeholder="Select shirt size"
                                            required
                                        />
                                    )}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeartIcon className="h-5 w-5 text-primary" />
                            Emergency Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isMobile ? (
                            <MobileFormField
                                type="input"
                                label="Contact Name"
                                value={watch('emergencyName')}
                                onChange={(value) => setValue('emergencyName', value)}
                                required
                                error={form.formState.errors.emergencyName?.message}
                            />
                        ) : (
                            <FormControl
                                name="emergencyName"
                                label="Contact Name"
                                render={(props) => (
                                    <Input
                                        {...props}
                                        required
                                    />
                                )}
                            />
                        )}

                        {isMobile ? (
                            <MobileFormField
                                type="input"
                                label="Contact Phone"
                                value={watch('emergencyPhone')}
                                onChange={(value) => setValue('emergencyPhone', value)}
                                required
                                error={form.formState.errors.emergencyPhone?.message}
                            />
                        ) : (
                            <FormControl
                                name="emergencyPhone"
                                label="Contact Phone"
                                render={(props) => (
                                    <Input
                                        {...props}
                                        type="tel"
                                        required
                                    />
                                )}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Pet Information */}
                {/* <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PawPrintIcon className="h-5 w-5 text-primary" />
                            Pet Information (Optional)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormControl
                            name="hasPet"
                            render={(props) => (
                                <Checkbox
                                    checked={props.value}
                                    onCheckedChange={props.onChange}
                                    label="I have a pet that will be joining me"
                                />
                            )
                            }
                        />

                        {hasPet && (
                            isMobile ? (
                                <MobileFormField
                                    type="input"
                                    label="Pet Name"
                                    value={watch('petName') || ''}
                                    onChange={(value) => setValue('petName', value)}
                                    required
                                    error={form.formState.errors.petName?.message}
                                />
                            ) : (
                                <FormControl
                                    name="petName"
                                    label="Pet Name"
                                    render={(props) => (
                                        <Input
                                            {...props}
                                            required
                                        />
                                    )}
                                />
                            )
                        )}
                    </CardContent>
                </Card> */}

                {/* Disclaimer */}
                {disclaimerText && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldIcon className="h-5 w-5 text-primary" />
                                Disclaimer Agreement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md max-h-48 overflow-y-auto">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {disclaimerText}
                                </p>
                            </div>

                            <FormControl
                                name="disclaimerAccepted"
                                render={(props) => (
                                    <Checkbox
                                        checked={props.value}
                                        onCheckedChange={props.onChange}
                                        label="I have read, understood, and agree to the terms of this disclaimer"
                                        error={props.error}
                                        required
                                    />
                                )}
                            />
                        </CardContent>
                    </Card>
                )}

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
                            {isSubmitting ? 'Registering...' : 'Register Athlete'}
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
                                    Creating athlete registration...
                                </p>
                                <p className="text-blue-600">
                                    Please wait while we process your registration.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Form>
        </FormProvider>
    );
};
