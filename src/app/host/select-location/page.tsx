'use client';

import { useEffect, useState } from 'react';

import type { LocationEntity } from '@/lib/db/entities/types';
import { useAuth } from '@/hooks/useAuth';
import { useLocationsByHost } from '@/hooks/useLocation';
import { useRouter } from 'next/navigation';

export default function SelectLocation() {
  const router = useRouter();
  const { isAuthenticated, isLoading, getHostId } = useAuth();
  // const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get host ID from auth hook
  const hostId = getHostId();
  
  // Fetch locations for this host
  const { data: locations, isLoading: isLoadingLocations, error: locationError } = useLocationsByHost(hostId || '');
  
  const handleLocationSelect = (location: LocationEntity) => {
    // Save the selected location to localStorage
    localStorage.setItem('currentLocationId', location.id);
    localStorage.setItem('currentHostId', location.hid);
    
    // Redirect to the check-in page
    router.push('/checkin');
  };
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/host/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // If the host only has one location, automatically select it
  useEffect(() => {
    if (locations && locations.length === 1) {
      handleLocationSelect(locations[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);
  
  // Show loading state
  if (isLoading || isLoadingLocations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-md">Loading...</h1>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (locationError || !locations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-md">Error</h1>
          <p className="text-red-500">{locationError?.toString() || 'Failed to load locations'}</p>
          <button 
            onClick={() => router.push('/host/login')}
            className="mt-lg bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  
  // No locations found
  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center card max-w-md w-full">
          <h1 className="text-2xl font-bold mb-md">No Locations Found</h1>
          <p className="mb-lg">
            You don&apos;t have any locations set up yet. Please contact the system administrator.
          </p>
          <button 
            onClick={() => router.push('/host/login')}
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="card w-full max-w-md">
        <div className="text-center mb-lg">
          <h1 className="text-2xl font-bold">Select Location</h1>
          <p className="text-gray-600 mt-sm">Choose a location to manage check-ins</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-lg" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <div className="flex flex-col gap-md">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => handleLocationSelect(location)}
              className="border border-gray-300 rounded p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-lg">{location.n}</h3>
              <p className="text-gray-600 text-sm">{location.a}</p>
            </button>
          ))}
        </div>
        
        <div className="mt-lg text-center">
          <button 
            onClick={() => router.push('/host/login')}
            className="text-primary hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}