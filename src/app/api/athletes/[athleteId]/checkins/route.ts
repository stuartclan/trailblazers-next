import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

// Get check-ins for an athlete
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    // Get check-ins for this athlete
    const checkIns = await repositories.checkins.getAthleteCheckIns(athleteId, limit);
    
    return NextResponse.json(checkIns);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error fetching check-ins for athlete ${params.athleteId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch athlete check-ins' },
      { status: 500 }
    );
  }
}