'use client';

import { useEffect, useState } from 'react';
import { useHost, useUpdateHost } from '@/hooks/useHost';
import { useLocation, useLocationsByHost, useUpdateLocationActivities } from '@/hooks/useLocation';

import Link from 'next/link';
import { useActivities } from '@/hooks/useActivity';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToastNotifications } from '@/hooks/useToast';

export default function HostSettings() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { success, error, info } = useToastNotifications();
  
  // Get current host and location from localStorage
  const [hostId, setHostId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  
  // Get host data
  const { data: host } = useHost(hostId || '');
  
  // Get locations for this host
  const { data: hostLocations } = useLocationsByHost(hostId || '');
  
  // Get current location
  const { data: location } = useLocation(locationId || '');
  
  // Get all activities
  const { data: activities } = useActivities(true); // include disabled
  
  // Form state
  const [adminPassword, setAdminPassword] = useState('');
  const [disclaimer, setDisclaimer] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  // UI state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingDisclaimer, setIsEditingDisclaimer] = useState(false);
  const [isEditingActivities, setIsEditingActivities] = useState(false);
  
  // Mutations
  const updateHost = useUpdateHost();
  const updateLocationActivities = useUpdateLocationActivities();
  
  // Load host/location from localStorage on component mount
  useEffect(() => {
    const savedHostId = localStorage.getItem('currentHostId');
    const savedLocationId = localStorage.getItem('currentLocationId');
    
    if (savedHostId && savedLocationId) {
      setHostId(savedHostId);
      setLocationId(savedLocationId);
      setSelectedLocation(savedLocationId);
    } else {
      // If no location is selected, redirect to location selection
      router.push('/host/select-location');
    }
  }, [router]);
  
  // Load host data into form
  useEffect(() => {
    if (host) {
      setDisclaimer(host.disc || '');
    }
  }, [host]);
  
  // Load location activities
  useEffect(() => {
    if (location) {
      setSelectedActivities(location.acts || []);
    }
  }, [location]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/host/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Check if admin password is already authenticated
  useEffect(() => {
    if (hostId) {
      const isAuth = sessionStorage.getItem(`host_admin_auth_${hostId}`);
      if (isAuth !== 'true') {
        router.push('/host/admin');
      }
    }
  }, [hostId, router]);
  
  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!hostId || !adminPassword) {
      error('Please enter a new password');
      return;
    }
    
    if (adminPassword.length < 6) {
      error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      info('Updating admin password...');
      
      await updateHost.mutateAsync({
        id: hostId,
        data: {
          p: adminPassword
        }
      });
      
      success('Admin password updated successfully');
      setIsEditingPassword(false);
      setAdminPassword('');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password';
      error(errorMessage);
    }
  };
  
  // Handle disclaimer update
  const handleDisclaimerUpdate = async () => {
    if (!hostId) return;
    
    try {
      info('Updating disclaimer...');
      
      await updateHost.mutateAsync({
        id: hostId,
        data: {
          disc: disclaimer
        }
      });
      
      success('Disclaimer updated successfully');
      setIsEditingDisclaimer(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update disclaimer';
      error(errorMessage);
    }
  };
  
  // Handle activities update
  const handleActivitiesUpdate = async () => {
    if (!selectedLocation) {
      error('Please select a location');
      return;
    }
    
    try {
      info('Updating location activities...');
      
      await updateLocationActivities.mutateAsync({
        locationId: selectedLocation,
        activityIds: selectedActivities
      });
      
      success('Activities updated successfully');
      setIsEditingActivities(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update activities';
      error(errorMessage);
    }
  };
  
  // Handle activity toggle
  const handleActivityToggle = (activityId: string) => {
    if (selectedActivities.includes(activityId)) {
      // Remove activity
      setSelectedActivities(selectedActivities.filter(id => id !== activityId));
    } else {
      // Add activity (enforce maximum of 3)
      if (selectedActivities.length < 3) {
        setSelectedActivities([...selectedActivities, activityId]);
      } else {
        error('Maximum 3 activities allowed per location');
      }
    }
  };
  
  // Handle location change
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocationId = e.target.value;
    setSelectedLocation(newLocationId);
    
    // Load activities for this location
    const loc = hostLocations?.find(l => l.id === newLocationId);
    if (loc) {
      setSelectedActivities(loc.acts || []);
      info(`Switched to location: ${loc.n}`);
    }
  };
  
  const handleCancelPasswordEdit = () => {
    setIsEditingPassword(false);
    setAdminPassword('');
  };
  
  const handleCancelDisclaimerEdit = () => {
    setIsEditingDisclaimer(false);
    if (host) {
      setDisclaimer(host.disc || '');
    }
  };
  
  const handleCancelActivitiesEdit = () => {
    setIsEditingActivities(false);
    if (location) {
      setSelectedActivities(location.acts || []);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Host Settings</h1>
          
          <Link
            href="/host/admin"
            className="text-primary hover:underline"
          >
            Back to Admin
          </Link>
        </div>
        
        {/* Admin Password Section */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Admin Password</h2>
          
          {isEditingPassword ? (
            <div>
              <div className="mb-4">
                <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Admin Password
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 border-1 border-gray-300 rounded-md"
                  placeholder="Enter new admin password"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters long
                </p>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancelPasswordEdit}
                  className="border-1 border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handlePasswordUpdate}
                  disabled={!adminPassword || updateHost.isPending}
                  className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateHost.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                The admin password is used to access the host admin area. This is different from your login credentials.
              </p>
              
              <button
                onClick={() => setIsEditingPassword(true)}
                className="text-primary hover:underline"
              >
                Change Admin Password
              </button>
            </div>
          )}
        </div>
        
        {/* Disclaimer Section */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Disclaimer</h2>
          
          {isEditingDisclaimer ? (
            <div>
              <div className="mb-4">
                <label htmlFor="disclaimer" className="block text-sm font-medium text-gray-700 mb-2">
                  Disclaimer Text
                </label>
                <textarea
                  id="disclaimer"
                  value={disclaimer}
                  onChange={(e) => setDisclaimer(e.target.value)}
                  className="w-full p-3 border-1 border-gray-300 rounded-md h-40"
                  placeholder="Enter disclaimer text that athletes will see during registration"
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancelDisclaimerEdit}
                  className="border-1 border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDisclaimerUpdate}
                  disabled={updateHost.isPending}
                  className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateHost.isPending ? 'Updating...' : 'Update Disclaimer'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                {disclaimer ? (
                  <p className="text-gray-700">{disclaimer}</p>
                ) : (
                  <p className="text-gray-500 italic">No disclaimer text set</p>
                )}
              </div>
              
              <button
                onClick={() => setIsEditingDisclaimer(true)}
                className="text-primary hover:underline"
              >
                Edit Disclaimer
              </button>
            </div>
          )}
        </div>
        
        {/* Activities Section */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Allowed Activities</h2>
          
          {hostLocations && hostLocations.length > 1 && (
            <div className="mb-6">
              <label htmlFor="locationSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Select Location
              </label>
              <select
                id="locationSelect"
                value={selectedLocation || ''}
                onChange={handleLocationChange}
                className="w-full p-3 border-1 border-gray-300 rounded-md"
              >
                <option value="" disabled>Select a location</option>
                {hostLocations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.n}</option>
                ))}
              </select>
            </div>
          )}
          
          {isEditingActivities ? (
            <div>
              <p className="text-gray-600 mb-4">Select up to 3 activities that are available at this location:</p>
              
              {activities && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {activities.map(activity => (
                    <div 
                      key={activity.id}
                      className={`border-1 rounded-md p-4 cursor-pointer transition-colors ${
                        selectedActivities.includes(activity.id) 
                          ? 'bg-primary-light border-primary' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleActivityToggle(activity.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          selectedActivities.includes(activity.id)
                            ? 'bg-primary text-white'
                            : 'bg-gray-200'
                        }`}>
                          <span className="material-icons">{activity.i}</span>
                        </div>
                        <div>
                          <h3 className="font-medium">{activity.n}</h3>
                          <p className="text-xs text-gray-500">
                            {selectedActivities.includes(activity.id) ? 'Selected' : 'Click to select'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancelActivitiesEdit}
                  className="border-1 border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleActivitiesUpdate}
                  disabled={!selectedLocation || updateLocationActivities.isPending}
                  className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLocationActivities.isPending ? 'Updating...' : 'Update Activities'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {activities && selectedActivities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {selectedActivities.map(activityId => {
                    const activity = activities.find(a => a.id === activityId);
                    if (!activity) return null;
                    
                    return (
                      <div key={activity.id} className="border-1 rounded-md p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary-light p-2 rounded-full">
                            <span className="material-icons text-primary">{activity.i}</span>
                          </div>
                          <div>
                            <h3 className="font-medium">{activity.n}</h3>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 italic mb-4">No activities selected for this location</p>
              )}
              
              <button
                onClick={() => setIsEditingActivities(true)}
                className="text-primary hover:underline"
              >
                Edit Activities
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}