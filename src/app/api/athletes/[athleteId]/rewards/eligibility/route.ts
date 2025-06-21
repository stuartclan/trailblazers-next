/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

// Get reward eligibility for an athlete
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  const { athleteId } = await params;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get athlete to verify it exists
    const athlete = await repositories.athletes.getAthleteById(athleteId);
    if (!athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      );
    }

    // Check if hostId is specified in query params
    const searchParams = request.nextUrl.searchParams;
    const hostId = searchParams.get('hostId');

    // Get global and host rewards
    const globalRewards = await repositories.rewards.getGlobalRewards();
    let hostRewards: any[] = [];

    if (hostId) {
      // Get host-specific rewards
      hostRewards = await repositories.rewards.getHostRewards(hostId);
    }

    // Get athlete check-ins
    const checkIns = await repositories.checkins.getAthleteCheckIns(athleteId, 1000);

    // Count check-ins (all of them for global rewards)
    const globalCheckInCount = checkIns.length;

    // Count check-ins for specific host if needed
    let hostCheckInCount = 0;

    if (hostId) {
      hostCheckInCount = checkIns.filter(checkIn => checkIn.hid === hostId).length;
    }

    // Get reward claims
    const rewardClaims = await repositories.rewardClaims.getAthleteRewardClaims(athleteId);

    // Check eligibility for global rewards
    const eligibleGlobalRewards = globalRewards
      .filter(reward => {
        // Check if the athlete has enough check-ins for this reward
        if (globalCheckInCount < reward.cnt) {
          return false;
        }

        // Check if the athlete has already claimed this reward
        const hasClaimedReward = rewardClaims.some(claim => claim.rid === reward.id);
        return !hasClaimedReward;
      })
      .map(reward => ({
        rewardId: reward.id,
        count: reward.cnt
      }));

    // Check eligibility for host rewards
    const eligibleHostRewards = hostRewards
      .filter(reward => {
        // Check if the athlete has enough check-ins for this reward
        if (hostCheckInCount < reward.cnt) {
          return false;
        }

        // Check if the athlete has already claimed this reward
        const hasClaimedReward = rewardClaims.some(claim => claim.rid === reward.id);
        return !hasClaimedReward;
      })
      .map(reward => ({
        rewardId: reward.id,
        count: reward.cnt
      }));

    return NextResponse.json({
      globalRewards: eligibleGlobalRewards,
      hostRewards: eligibleHostRewards
    });
  } catch (error: any) {
    console.error(`Error checking reward eligibility for athlete ${athleteId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to check athlete reward eligibility' },
      { status: 500 }
    );
  }
}
