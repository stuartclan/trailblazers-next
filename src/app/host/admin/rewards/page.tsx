'use client';

import { useCreateRewardClaim, useGlobalRewards, useHostRewards, useOneAwayAthletes } from '@/hooks/useReward';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useHost } from '@/hooks/useHost';
import { useLocation } from '@/hooks/useLocation';
import { useRouter } from 'next/navigation';

export default function HostRewards() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Get current host and location from localStorage
  const [hostId, setHostId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  
  // Get host data
  const { data: host } = useHost(hostId || '');
  
  // Get location data
  const { data: location } = useLocation(locationId || '');
  
  // Get rewards
  const { data: globalRewards } = useGlobalRewards();
  const { data: hostRewards } = useHostRewards(hostId || '');
  
  // Get one-away athletes
  const { data: oneAwayAthletes } = useOneAwayAthletes(hostId || '');
  
  // UI state
  const [showAllEligible, setShowAllEligible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Claim reward mutation
  const createRewardClaim = useCreateRewardClaim();
  
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
  
  // Check if admin password is already authenticated
  useEffect(() => {
    if (hostId) {
      const isAuth = sessionStorage.getItem(`host_admin_auth_${hostId}`);
      if (isAuth !== 'true') {
        router.push('/host/admin');
      }
    }
  }, [hostId, router]);
  
  // Handle claim reward
  const handleClaimReward = async (athleteId: string, rewardId: string) => {
    if (!hostId || !locationId) return;
    
    try {
      await createRewardClaim.mutateAsync({
        athleteId,
        rewardId,
        hostId,
        locationId
      });
      
      setSuccessMessage('Reward claimed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to claim reward');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
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
  
  // Combine and process one-away athletes
  const eligibleAthletes = oneAwayAthletes ? [
    ...(oneAwayAthletes.globalOneAway || []).map(item => ({
      ...item,
      type: 'global' as const
    })),
    ...(oneAwayAthletes.hostOneAway || []).map(item => ({
      ...item,
      type: 'host' as const
    }))
  ] : [];
  
  // Helper function to get reward name by ID
  const getRewardName = (rewardId: string, type: 'global' | 'host') => {
    if (type === 'global' && globalRewards) {
      const reward = globalRewards.find(r => r.id === rewardId);
      return reward ? reward.n : 'Unknown Reward';
    } else if (type === 'host' && hostRewards) {
      const reward = hostRewards.find(r => r.id === rewardId);
      return reward ? reward.n : 'Unknown Reward';
    }
    return 'Unknown Reward';
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container max-w-4xl">
        <div className="flex justify-between items-center mb-lg">
          <h1 className="text-2xl font-bold">Manage Rewards</h1>
          
          <Link
            href="/host/admin"
            className="text-primary hover:underline"
          >
            Back to Admin
          </Link>
        </div>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-lg" role="alert">
            <p>{successMessage}</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-lg" role="alert">
            <p>{errorMessage}</p>
          </div>
        )}
        
        <div className="card mb-lg">
          <div className="flex justify-between items-center mb-md">
            <h2 className="text-xl font-bold">Athletes Eligible for Rewards</h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showAllEligible"
                checked={showAllEligible}
                onChange={() => setShowAllEligible(!showAllEligible)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="showAllEligible" className="ml-2 text-sm text-gray-700">
                Show all eligible (not just from today)
              </label>
            </div>
          </div>
          
          {eligibleAthletes && eligibleAthletes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Athlete</th>
                    <th className="text-left py-2 px-3">Reward</th>
                    <th className="text-left py-2 px-3">Progress</th>
                    <th className="text-right py-2 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleAthletes.map((athlete, index) => (
                    <tr key={`${athlete.athleteId}-${athlete.rewardId}-${index}`} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        {/* In a real app, this would use a query to fetch the athlete name */}
                        <Link
                          href={`/host/admin/athletes/${athlete.athleteId}`}
                          className="text-primary hover:underline"
                        >
                          {athlete.athleteId}
                        </Link>
                      </td>
                      <td className="py-2 px-3">
                        {getRewardName(athlete.rewardId, athlete.type)}
                        <span className="ml-2 text-xs px-2 py-1 bg-gray-200 rounded-full">
                          {athlete.type === 'global' ? 'Global' : 'Host'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {athlete.currentCount} / {athlete.requiredCount}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleClaimReward(athlete.athleteId, athlete.rewardId)}
                          disabled={createRewardClaim.isPending}
                          className="bg-primary text-white py-1 px-3 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Claim
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 italic">No athletes currently eligible for rewards</p>
          )}
        </div>
        
        {/* Host Custom Rewards */}
        <div className="card mb-lg">
          <div className="flex justify-between items-center mb-md">
            <h2 className="text-xl font-bold">Host Custom Rewards</h2>
            
            <Link
              href="/host/admin/rewards/custom"
              className="text-primary hover:underline text-sm"
            >
              Manage Custom Rewards
            </Link>
          </div>
          
          {hostRewards && hostRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {hostRewards.map((reward) => (
                <div key={reward.id} className="border rounded-md p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-light p-2 rounded-full">
                      <span className="material-icons text-primary">{reward.i}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{reward.n}</h3>
                      <p className="text-sm text-gray-600">{reward.cnt} check-ins required</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-md">
              <p className="text-gray-600 mb-md">No custom rewards configured</p>
              <Link
                href="/host/admin/rewards/custom"
                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
              >
                Create Custom Reward
              </Link>
            </div>
          )}
        </div>
        
        {/* Global Rewards */}
        <div className="card">
          <h2 className="text-xl font-bold mb-md">Global Trailblazer Rewards</h2>
          
          {globalRewards && globalRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {globalRewards.map((reward) => (
                <div key={reward.id} className="border rounded-md p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-light p-2 rounded-full">
                      <span className="material-icons text-primary">{reward.i}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{reward.n}</h3>
                      <p className="text-sm text-gray-600">{reward.cnt} check-ins required</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No global rewards configured</p>
          )}
        </div>
      </div>
    </div>
  );
}