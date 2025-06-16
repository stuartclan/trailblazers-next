import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

// Check if athlete has checked in recently at a host
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> },
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
    
    // TODO: This seems to be in the wrong place
    const { athleteId } = await params;
    
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
    
    if (!hostId) {
      return NextResponse.json(
        { error: 'hostId query parameter is required' },
        { status: 400 }
      );
    }
    
    // Check if athlete has checked in at this host within the last week
    const hasCheckedIn = await repositories.checkins.hasCheckedInAtHostWithinWeek(athleteId, hostId);
    
    return NextResponse.json({ hasCheckedIn });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error checking recent check-ins for athlete ${params.athleteId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to check recent check-ins' },
      { status: 500 }
    );
  }
}