'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { useCreateRewardClaim, useGlobalRewards, useHostRewards, useOneAwayAthletes } from '@/hooks/useReward';
import { useEffect, useState } from 'react';

import { Checkbox } from '@/components/atoms/checkbox/checkbox';
import Link from 'next/link';
import { RewardsPageLoading } from '@/components/molecules/loading-states/loading-states';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToastNotifications } from '@/hooks/useToast';

export default function HostRewards() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Get current host and location from localStorage
  const [hostId, setHostId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const { success, error, info } = useToastNotifications();

  // Get rewards
  const { data: globalRewards } = useGlobalRewards();
  const { data: hostRewards } = useHostRewards(hostId || '');

  // Get one-away athletes
  const { data: oneAwayAthletes } = useOneAwayAthletes(hostId || '');

  // UI state
  const [showAllEligible, setShowAllEligible] = useState(false);

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

    // Show progress toast
    info('Processing reward claim...', 'Reward Claim');

    try {
      await createRewardClaim.mutateAsync({
        athleteId,
        rewardId,
        hostId,
        locationId
      });

      // Get reward name for better user experience
      const reward = [...(globalRewards || []), ...(hostRewards || [])].find(r => r.id === rewardId);
      const rewardName = reward?.n || 'Unknown Reward';

      success(
        `Reward "${rewardName}" has been claimed successfully!`,
        'Reward Claimed'
      );

    } catch (err) {
      console.error('Reward claim error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim reward';
      error(errorMessage, 'Claim Failed');
    }
  };

  // Show skeleton loading state instead of basic loading
  if (isLoading) {
    return <RewardsPageLoading />;
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
    <div className="container max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-white font-bold !m-0">Manage Rewards</h1>
      </div>

      <Card>
        <CardHeader row>
          <CardTitle>Athletes Eligible for Rewards</CardTitle>
          {/* <CardDescription>This page shows emergency contacts for athletes who have checked in recently</CardDescription> */}
          <div className="flex items-center">
            <Checkbox
              checked={showAllEligible}
              onCheckedChange={() => setShowAllEligible(!showAllEligible)}
              label="Show all eligible (not just from today)"
            />
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Host Custom Rewards */}
      <Card>
        <CardHeader row>
          <CardTitle>Host Custom Rewards</CardTitle>
          <Link
            href="/host/admin/rewards/custom"
            className="text-primary hover:underline text-sm"
          >
            Manage Custom Rewards
          </Link>
        </CardHeader>
        <CardContent>
          {hostRewards && hostRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hostRewards.map((reward) => (
                <div key={reward.id} className="border-1 rounded-md p-4 hover:bg-gray-50">
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
              <p className="text-gray-600 mb-4">No custom rewards configured</p>
              <Link
                href="/host/admin/rewards/custom"
                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
              >
                Create Custom Reward
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Rewards */}
      <Card>
        <CardHeader row>
          <CardTitle>Global Trailblazer Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          {globalRewards && globalRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {globalRewards.map((reward) => (
                <div key={reward.id} className="border-1 rounded-md p-4 hover:bg-gray-50">
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
        </CardContent>
      </Card>
    </div>
  );
}
