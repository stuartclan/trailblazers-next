import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

// Get reward claims for an athlete
export async function GET(
  request: NextRequest,
  { params }: { params: { athleteId: string } }
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
    
    const athleteId = params.athleteId;
    
    // Get athlete to verify it exists
    const athlete = await repositories.athletes.getAthleteById(athleteId);
    if (!athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      );
    }
    
    // Get reward claims for this athlete
    const claims = await repositories.rewardClaims.getAthleteRewardClaims(athleteId);
    
    return NextResponse.json(claims);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error fetching reward claims for athlete ${params.athleteId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch athlete reward claims' },
      { status: 500 }
    );
  }
}