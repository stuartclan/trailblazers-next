'use client';

import { useEffect, useState } from 'react';

import { Alert } from '@/components/atoms/alert/alert';
import { Button } from '@/components/atoms/button/button';
import { CheckInFlow } from '@/components/organisms/check-in-flow/check-in-flow';
import { CheckInPageLoading } from '@/components/molecules/loading-states/loading-states';
import { ErrorDisplay } from '@/components/molecules/error-display/error-display';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useHost } from '@/hooks/useHost';
import { useLocation } from '@/hooks/useLocation';
import { useRouter } from 'next/navigation';

export default function CheckIn() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Get current host and location from localStorage
  const [hostId, setHostId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Fetch host and location data
  const { data: host, isLoading: isLoadingHost, error: hostError } = useHost(hostId || '');
  const { data: location, isLoading: isLoadingLocation, error: locationError } = useLocation(locationId || '');
  
  // Load host/location from localStorage on component mount
  useEffect(() => {
    const savedHostId = localStorage.getItem('currentHostId');
    const savedLocationId = localStorage.getItem('currentLocationId');
    
    if (savedHostId && savedLocationId) {
      setHostId(savedHostId);
      setLocationId(savedLocationId);
    } else {
      // If no location is selected, redirect to location selection
      router.push('/host/select-location');
    }
  }, [router]);
  
  // Mark as ready when we have all the data
  useEffect(() => {
    if (host && location && !isLoadingHost && !isLoadingLocation) {
      setIsReady(true);
    }
  }, [host, location, isLoadingHost, isLoadingLocation]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/host/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Handle navigation to athlete registration
  const handleNewAthlete = () => {
    router.push('/signup');
  };
  
  // Handle changing location
  const handleChangeLocation = () => {
    router.push('/host/select-location');
  };
  
  // Show skeleton loading state instead of spinner
  if (isLoading || isLoadingHost || isLoadingLocation || !isReady) {
    return <CheckInPageLoading />;
  }
  
  // Show error state
  if (hostError || locationError || !host || !location) {
    return (
      <ErrorDisplay
        title="Configuration Error"
        message={
          hostError ? "Failed to load host information" :
          locationError ? "Failed to load location information" :
          !host ? "Host not found" :
          "Location not found"
        }
        error={hostError || locationError}
        onRetry={() => window.location.reload()}
        onGoHome={() => router.push('/host/login')}
      />
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trailblazers Check-In</h1>
            <p className="text-gray-600 mt-1">Welcome to {host.n}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleChangeLocation}
            >
              Change Location
            </Button>
            <Link href="/host/admin">
              <Button variant="ghost" size="sm">
                Host Admin
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Location Info */}
        <Alert variant="info" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Location: {location.n}</p>
              <p className="text-sm text-gray-600">{location.a}</p>
            </div>
          </div>
        </Alert>
        
        {/* Main Check-in Flow */}
        <CheckInFlow
          host={host}
          location={location}
          onNewAthlete={handleNewAthlete}
          className="mb-6"
        />
        
        {/* Footer */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <div>
              <p>Need help? Contact your host administrator.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/signup" className="text-primary hover:underline">
                Register New Athlete
              </Link>
              <Link href="/host/admin" className="text-primary hover:underline">
                Host Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}