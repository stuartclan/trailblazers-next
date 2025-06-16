'use client';

import { ArrowLeft, Heart, Shield, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { FormProvider, useForm } from 'react-hook-form';
import { useCreateAthlete, useSignDisclaimer } from '@/hooks/useAthlete';
import { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/button/button';
import { Checkbox } from '@/components/atoms/checkbox/checkbox';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { Form } from '@/components/atoms/form/form';
import { FormControl } from '@/components/atoms/form-control/form-control';
import { Input } from '@/components/atoms/input/input';
import { MobileFormField } from '@/components/molecules/mobile-form-field/mobile-form-field';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { Select } from '@/components/atoms/select/select';
import { SignupFormLoading } from '@/components/molecules/loading-states/loading-states';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePet } from '@/hooks/usePet';
import { useHost } from '@/hooks/useHost';
import { useRouter } from 'next/navigation';
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
  hasPet: z.boolean().default(false),
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

export default function Signup() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { success, error, info } = useToastNotifications();
  
  // Get current host from localStorage
  const [hostId, setHostId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Fetch host details
  const { data: host, isLoading: isLoadingHost, error: hostError } = useHost(hostId || '');
  
  // Mutations
  const createAthlete = useCreateAthlete();
  const createPet = useCreatePet();
  const signDisclaimer = useSignDisclaimer();
  
  // Form setup
  const methods = useForm<AthleteFormValues>({
    resolver: zodResolver(athleteSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleInitial: '',
      email: '',
      employer: '',
      shirtGender: '',
      shirtSize: '',
      emergencyName: '',
      emergencyPhone: '',
      hasPet: false,
      petName: '',
      disclaimerAccepted: false,
    },
  });

  const { watch, setValue } = methods;
  const hasPet = watch('hasPet');
  
  // Load host from localStorage
  useEffect(() => {
    const savedHostId = localStorage.getItem('currentHostId');
    if (savedHostId) {
      setHostId(savedHostId);
    } else {
      router.push('/host/select-location');
    }
  }, [router]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/host/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);
  
  // Handle form submission
  const handleSubmit = async (data: AthleteFormValues) => {
    if (!hostId) {
      error('No host selected. Please return to check-in.');
      return;
    }
    
    setIsSubmitting(true);
    info('Creating athlete registration...');
    
    try {
      // Create the athlete
      const newAthlete = await createAthlete.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        middleInitial: data.middleInitial,
        email: data.email,
        employer: data.employer,
        shirtGender: data.shirtGender,
        shirtSize: data.shirtSize,
        emergencyName: data.emergencyName,
        emergencyPhone: data.emergencyPhone,
      });
      
      info('Signing disclaimer...');
      
      // Sign the disclaimer
      await signDisclaimer.mutateAsync({
        athleteId: newAthlete.id,
        hostId,
      });
      
      // Create a pet if specified
      if (data.hasPet && data.petName?.trim()) {
        info('Registering pet...');
        await createPet.mutateAsync({
          athleteId: newAthlete.id,
          name: data.petName.trim(),
        });
      }
      
      success(`Welcome ${data.firstName}! Registration completed successfully.`, 'Registration Complete');
      setSubmitSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push('/checkin');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      error(errorMessage, 'Registration Failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state with skeleton instead of basic loading
  if (isAuthLoading || isLoadingHost) {
    return <SignupFormLoading />;
  }
  
  // Error state
  if (hostError || !host) {
    return (
      <ErrorDisplay
        title="Unable to Load Registration"
        message="Could not load host information for registration."
        onGoHome={() => router.push('/checkin')}
        showRetry={false}
      />
    );
  }
  
  // Success state
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Welcome to Trailblazers! Redirecting to check-in...
            </p>
            <TouchTarget>
              <Button onClick={() => router.push('/checkin')}>
                Go to Check-in Now
              </Button>
            </TouchTarget>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const shirtGenderOptions = [
    { value: '', label: 'Select gender...' },
    { value: 'Men', label: 'Men' },
    { value: 'Women', label: 'Women' },
    { value: 'Unisex', label: 'Unisex' },
  ];
  
  const shirtSizeOptions = [
    { value: '', label: 'Select size...' },
    { value: 'XS', label: 'Extra Small (XS)' },
    { value: 'S', label: 'Small (S)' },
    { value: 'M', label: 'Medium (M)' },
    { value: 'L', label: 'Large (L)' },
    { value: 'XL', label: 'Extra Large (XL)' },
    { value: 'XXL', label: '2X Large (XXL)' },
    { value: 'XXXL', label: '3X Large (XXXL)' },
  ];
  
  // Check if we're on mobile (simple check)
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <PageHeader
          title="Register New Athlete"
          description={`Join the Trailblazers community at ${host.n}`}
          breadcrumbs={[
            { label: 'Check-in', href: '/checkin' },
            { label: 'Register', current: true }
          ]}
          actions={
            <TouchTarget>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/checkin')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Check-in
              </Button>
            </TouchTarget>
          }
        />
        
        <FormProvider {...methods}>
          <Form
            onSubmit={methods.handleSubmit(handleSubmit)}
            isSubmitting={isSubmitting}
          >
            {/* Personal Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
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
                        placeholder="Enter first name"
                        required
                        error={methods.formState.errors.firstName?.message}
                      />
                    ) : (
                      <FormControl
                        name="firstName"
                        label="First Name"
                        render={({ field, error }) => (
                          <Input
                            {...field}
                            error={error}
                            placeholder="Enter first name"
                          />
                        )}
                      />
                    )}
                  </div>
                  
                  {isMobile ? (
                    <MobileFormField
                      type="input"
                      label="M.I."
                      value={watch('middleInitial') || ''}
                      onChange={(value) => setValue('middleInitial', value)}
                      placeholder="M"
                      error={methods.formState.errors.middleInitial?.message}
                    />
                  ) : (
                    <FormControl
                      name="middleInitial"
                      label="M.I."
                      render={({ field, error }) => (
                        <Input
                          {...field}
                          error={error}
                          placeholder="M"
                          maxLength={1}
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
                    placeholder="Enter last name"
                    required
                    error={methods.formState.errors.lastName?.message}
                  />
                ) : (
                  <FormControl
                    name="lastName"
                    label="Last Name"
                    render={({ field, error }) => (
                      <Input
                        {...field}
                        error={error}
                        placeholder="Enter last name"
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
                    placeholder="Enter email address"
                    required
                    error={methods.formState.errors.email?.message}
                  />
                ) : (
                  <FormControl
                    name="email"
                    label="Email Address"
                    render={({ field, error }) => (
                      <Input
                        {...field}
                        type="email"
                        error={error}
                        placeholder="Enter email address"
                      />
                    )}
                  />
                )}
                
                {isMobile ? (
                  <MobileFormField
                    type="input"
                    label="Employer (Optional)"
                    value={watch('employer') || ''}
                    onChange={(value) => setValue('employer', value)}
                    placeholder="Enter employer name"
                    error={methods.formState.errors.employer?.message}
                  />
                ) : (
                  <FormControl
                    name="employer"
                    label="Employer (Optional)"
                    render={({ field, error }) => (
                      <Input
                        {...field}
                        error={error}
                        placeholder="Enter employer name"
                      />
                    )}
                  />
                )}
              </CardContent>
            </Card>
            
            {/* T-Shirt Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>T-Shirt Information (Optional)</CardTitle>
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
                      error={methods.formState.errors.shirtGender?.message}
                    />
                  ) : (
                    <FormControl
                      name="shirtGender"
                      label="Shirt Style"
                      render={({ field, error }) => (
                        <Select
                          options={shirtGenderOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          error={error}
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
                      error={methods.formState.errors.shirtSize?.message}
                    />
                  ) : (
                    <FormControl
                      name="shirtSize"
                      label="Shirt Size"
                      render={({ field, error }) => (
                        <Select
                          options={shirtSizeOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          error={error}
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
                  <Heart className="h-5 w-5 text-red-500" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isMobile ? (
                  <MobileFormField
                    type="input"
                    label="Emergency Contact Name"
                    value={watch('emergencyName')}
                    onChange={(value) => setValue('emergencyName', value)}
                    placeholder="Enter emergency contact name"
                    required
                    error={methods.formState.errors.emergencyName?.message}
                  />
                ) : (
                  <FormControl
                    name="emergencyName"
                    label="Emergency Contact Name"
                    render={({ field, error }) => (
                      <Input
                        {...field}
                        error={error}
                        placeholder="Enter emergency contact name"
                      />
                    )}
                  />
                )}
                
                {isMobile ? (
                  <MobileFormField
                    type="input"
                    label="Emergency Contact Phone"
                    value={watch('emergencyPhone')}
                    onChange={(value) => setValue('emergencyPhone', value)}
                    placeholder="Enter phone number"
                    required
                    error={methods.formState.errors.emergencyPhone?.message}
                  />
                ) : (
                  <FormControl
                    name="emergencyPhone"
                    label="Emergency Contact Phone"
                    render={({ field, error }) => (
                      <Input
                        {...field}
                        type="tel"
                        error={error}
                        placeholder="Enter phone number"
                      />
                    )}
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Pet Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pet Information (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TouchTarget>
                  <FormControl
                    name="hasPet"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        label="I have a pet that will be joining me"
                      />
                    )}
                  />
                </TouchTarget>
                
                {hasPet && (
                  isMobile ? (
                    <MobileFormField
                      type="input"
                      label="Pet Name"
                      value={watch('petName') || ''}
                      onChange={(value) => setValue('petName', value)}
                      placeholder="Enter your pet's name"
                      required
                      error={methods.formState.errors.petName?.message}
                    />
                  ) : (
                    <FormControl
                      name="petName"
                      label="Pet Name"
                      render={({ field, error }) => (
                        <Input
                          {...field}
                          error={error}
                          placeholder="Enter your pet's name"
                        />
                      )}
                    />
                  )
                )}
              </CardContent>
            </Card>
            
            {/* Disclaimer */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Disclaimer Agreement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md max-h-48 overflow-y-auto">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {host.disc || `By participating in activities at this location, you acknowledge that you are participating voluntarily and at your own risk. You understand that physical activities involve inherent risks of injury, and you assume all such risks. You agree to release, indemnify, and hold harmless the host organization, its employees, and volunteers from any and all claims, damages, or injuries that may arise from your participation.`}
                  </p>
                </div>
                
                <TouchTarget>
                  <FormControl
                    name="disclaimerAccepted"
                    render={({ field, error }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        label="I have read, understood, and agree to the terms of this disclaimer"
                        error={error}
                      />
                    )}
                  />
                </TouchTarget>
              </CardContent>
            </Card>
            
            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <TouchTarget className="flex-1">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push('/checkin')}
                  className="w-full"
                >
                  Cancel
                </Button>
              </TouchTarget>
              <TouchTarget className="flex-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Registering...' : 'Register Athlete'}
                </Button>
              </TouchTarget>
            </div>
          </Form>
        </FormProvider>
      </div>
    </div>
  );
}