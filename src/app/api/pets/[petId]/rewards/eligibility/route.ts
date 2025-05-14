import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

// Get reward eligibility for a pet
export async function GET(
  request: NextRequest,
  { params }: { params: { petId: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const petId = params.petId;
    
    // Get pet to verify it exists
    const pet = await repositories.pets.getPetById(petId);
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }
    
    // Check if hostId is specified in query params
    const searchParams = request.nextUrl.searchParams;
    const hostId = searchParams.get('hostId');
    
    // Get pet rewards
    const petRewards = await repositories.rewards.getPetRewards();
    
    // Get pet check-ins
    const checkIns = await repositories.checkins.getPetCheckIns(petId, 1000);
    
    // If hostId is specified, filter check-ins for that host
    const filteredCheckIns = hostId 
      ? checkIns.filter(checkIn => checkIn.hid === hostId)
      : checkIns;
    
    // Count check-ins
    const checkInCount = filteredCheckIns.length;
    
    // Get reward claims
    const athleteRewardClaims = await repositories.rewardClaims.getAthleteRewardClaims(pet.aid);
    
    // Filter reward claims for this pet
    const petRewardClaims = athleteRewardClaims.filter(claim => claim.pid === petId);
    
    // Check eligibility for each pet reward
    const eligibleRewards = petRewards
      .filter(reward => {
        // Check if the pet has enough check-ins for this reward
        if (checkInCount < reward.cnt) {
          return false;
        }
        
        // Check if the pet has already claimed this reward
        const hasClaimedReward = petRewardClaims.some(claim => claim.rid === reward.id);
        return !hasClaimedReward;
      })
      .map(reward => ({
        rewardId: reward.id,
        count: reward.cnt
      }));
    
    return NextResponse.json({
      petRewards: eligibleRewards
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error checking reward eligibility for pet ${params.petId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to check pet reward eligibility' },
      { status: 500 }
    );
  }
}