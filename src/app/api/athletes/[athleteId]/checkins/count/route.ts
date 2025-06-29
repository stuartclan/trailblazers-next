import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

// Get check-in count for an athlete
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> },
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

    // Get check-in count
    let count;
    if (hostId) {
      // Get check-in count for the specified host
      count = await repositories.checkins.getAthleteCheckInCountByHost(athleteId, hostId);
    } else {
      // Get all check-ins and count them
      // const checkIns = await repositories.checkins.getAthleteCheckIns(athleteId, 1000);
      // count = checkIns.length;
      count = await repositories.checkins.getAthleteCheckInCount(athleteId);
    }

    return NextResponse.json({ count });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error counting check-ins for athlete ${athleteId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to count athlete check-ins' },
      { status: 500 }
    );
  }
}
