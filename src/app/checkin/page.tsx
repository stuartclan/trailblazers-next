'use client';

import { useEffect, useState } from 'react';

import { AthleteEntity } from '@/lib/db/entities/types';
import { useAthleteSearch } from '@/hooks/useAthlete';
import { useAuth } from '@/hooks/useAuth';
import { useCreateCheckIn } from '@/hooks/useCheckIn';
import { useLocation } from '@/hooks/useLocation';
import { useLocationActivities } from '@/hooks/useActivity';
import { useRouter } from 'next/navigation';

export default function CheckIn() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Get current host and location from localStorage
  const [hostId, setHostId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteEntity | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Fetch location data
  const { data: location } = useLocation(locationId || '');
  
  // Fetch activities for this location
  const { data: activities } = useLocationActivities(locationId || '');
  
  // Search for athletes
  const { data: searchResults, isLoading: isSearching } = useAthleteSearch(searchQuery);
  
  // Check-in mutation
  const createCheckIn = useCreateCheckIn();
  
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
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/host/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Clear any previous selections
    setSelectedAthlete(null);
    setSelectedActivity(null);
    setCheckInStatus('idle');
    setErrorMessage(null);
  };
  
  // Handle athlete selection
  const handleAthleteSelect = (athlete: AthleteEntity) => {
    setSelectedAthlete(athlete);
    setSelectedActivity(null);
    setCheckInStatus('idle');
    setErrorMessage(null);
  };
  
  // Handle activity selection
  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId);
    setCheckInStatus('idle');
    setErrorMessage(null);
  };
  
  // Handle check-in submission
  const handleCheckIn = async () => {
    if (!selectedAthlete || !selectedActivity || !hostId || !locationId) {
      setErrorMessage('Please select an athlete and activity');
      return;
    }
    
    try {
      await createCheckIn.mutateAsync({
        athleteId: selectedAthlete.id,
        hostId,
        locationId,
        activityId: selectedActivity
      });
      
      // Reset form on success
      setCheckInStatus('success');
      setSelectedAthlete(null);
      setSelectedActivity(null);
      setSearchQuery('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setCheckInStatus('idle');
      }, 3000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setCheckInStatus('error');
      setErrorMessage(error.message || 'Failed to check in');
    }
  };
  
  // Handle new athlete registration
  const handleNewAthlete = () => {
    router.push('/signup');
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-md">Loading...</h1>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container max-w-2xl">
        <div className="flex justify-between items-center mb-lg">
          <h1 className="text-2xl font-bold">Trailblazers Check-In</h1>
          
          {location && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Location:</p>
              <p className="font-medium">{location.n}</p>
            </div>
          )}
        </div>
        
        <div className="card">
          <div className="mb-lg">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-sm">
              Search for Athlete by Name
            </label>
            <input
              type="text"
              id="search"
              placeholder="Type a last name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Search Results */}
          {searchQuery.length > 0 && (
            <div className="mb-lg">
              <h3 className="font-medium mb-sm">Search Results</h3>
              
              {isSearching && (
                <p className="text-gray-600 italic">Searching...</p>
              )}
              
              {!isSearching && searchResults && searchResults.length === 0 && (
                <div className="text-center py-md">
                  <p className="text-gray-600 mb-md">No athletes found with that name.</p>
                  <button
                    onClick={handleNewAthlete}
                    className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Register New Athlete
                  </button>
                </div>
              )}
              
              {!isSearching && searchResults && searchResults.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  {searchResults.map((athlete) => (
                    <div
                      key={athlete.id}
                      className={`p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                        selectedAthlete?.id === athlete.id ? 'bg-primary-light' : ''
                      }`}
                      onClick={() => handleAthleteSelect(athlete)}
                    >
                      <div className="font-medium">{athlete.fn} {athlete.ln}</div>
                      {athlete.e && <div className="text-sm text-gray-600">{athlete.e}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Activity Selection */}
          {selectedAthlete && activities && activities.length > 0 && (
            <div className="mb-lg">
              <h3 className="font-medium mb-sm">Select Activity for {selectedAthlete.fn}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {activities.map((activity) => (
                  <button
                    key={activity.id}
                    className={`p-4 border rounded-md flex flex-col items-center justify-center hover:bg-gray-50 transition-colors ${
                      selectedActivity === activity.id ? 'bg-primary-light border-primary' : ''
                    }`}
                    onClick={() => handleActivitySelect(activity.id)}
                  >
                    <span className="material-icons text-2xl mb-2">{activity.i}</span>
                    <span>{activity.n}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          {selectedAthlete && selectedActivity && (
            <div className="mb-lg">
              <button
                onClick={handleCheckIn}
                disabled={createCheckIn.isPending}
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createCheckIn.isPending ? 'Checking in...' : 'Check In'}
              </button>
            </div>
          )}
          
          {/* Status Messages */}
          {checkInStatus === 'success' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-lg" role="alert">
              <p className="font-bold">Success!</p>
              <p>Check-in completed successfully.</p>
            </div>
          )}
          
          {checkInStatus === 'error' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-lg" role="alert">
              <p className="font-bold">Error</p>
              <p>{errorMessage}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-lg">
          <button
            onClick={handleNewAthlete}
            className="text-primary hover:underline"
          >
            Register New Athlete
          </button>
          
          <button
            onClick={() => router.push('/host/admin')}
            className="text-primary hover:underline"
          >
            Host Admin
          </button>
        </div>
      </div>
    </div>
  );
}