'use client';

import { ArrowLeft, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { useCreateAthlete, useSignDisclaimer } from '@/hooks/useAthlete';
import { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/button/button';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import { PageHeader } from '@/components/molecules/page-header/page-header';
import { SignupForm } from '@/components/organisms/signup-form/signup-form';
import { SignupFormLoading } from '@/components/molecules/loading-states/loading-states';
import { TouchTarget } from '@/components/atoms/touch-target/touch-target';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePet } from '@/hooks/usePet';
import { useHost } from '@/hooks/useHost';
import { useRouter } from 'next/navigation';
import { useToastNotifications } from '@/hooks/useToast';

export default function Signup() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { success, error, info } = useToastNotifications();

  // Get current host from localStorage
  const [hostId, setHostId] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch host details
  const { data: host, isLoading: isLoadingHost, error: hostError, refetch: refetchHost } = useHost(hostId || '');

  // Mutations
  const createAthlete = useCreateAthlete();
  const createPet = useCreatePet();
  const signDisclaimer = useSignDisclaimer();

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
  const handleSignupSubmit = async (data: {
    firstName: string;
    lastName: string;
    middleInitial?: string;
    email: string;
    employer?: string;
    shirtGender?: string;
    shirtSize?: string;
    emergencyName: string;
    emergencyPhone: string;
    hasPet?: boolean;
    petName?: string;
    disclaimerAccepted: boolean;
  }) => {
    if (!hostId) {
      error('No host selected. Please return to check-in.');
      return;
    }

    info('Processing athlete registration...', 'Registration');

    try {
      // Create the athlete
      info('Creating athlete profile...', 'Creating Profile');
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

      info('Signing disclaimer...', 'Disclaimer');

      // Sign the disclaimer
      await signDisclaimer.mutateAsync({
        athleteId: newAthlete.id,
        hostId,
      });

      // Create a pet if specified
      if (data.hasPet && data.petName?.trim()) {
        info('Registering pet...', 'Pet Registration');
        await createPet.mutateAsync({
          athleteId: newAthlete.id,
          name: data.petName.trim(),
        });
      }

      success(
        `Welcome ${data.firstName}! Registration completed successfully.`,
        'Registration Complete'
      );
      setSubmitSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push('/checkin');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      error(errorMessage, 'Registration Failed');
      throw err; // Let the form handle the error state
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/checkin');
  };

  // Loading state with skeleton
  if (isAuthLoading || isLoadingHost) {
    return <SignupFormLoading />;
  }

  // Error state
  if (hostError || !host) {
    return (
      <ErrorDisplay
        title="Unable to Load Registration"
        message="Could not load host information for registration."
        error={hostError}
        onRetry={refetchHost}
        onGoHome={() => router.push('/checkin')}
      />
    );
  }

  // Success state
  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
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

        <SignupForm
          onSubmit={handleSignupSubmit}
          disclaimerText={host.disc || `By participating in activities at this location, you acknowledge that you are participating voluntarily and at your own risk. You understand that physical activities involve inherent risks of injury, and you assume all such risks. You agree to release, indemnify, and hold harmless the host organization, its employees, and volunteers from any and all claims, damages, or injuries that may arise from your participation.`}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
