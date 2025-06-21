import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

// Get check-in count for a pet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ petId: string }> }
) {
  const { petId } = await params;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Get check-in count
    let count;

    // For now, we'll just count all check-ins since we don't have a specific method
    // for counting pet check-ins by host
    const checkIns = await repositories.checkins.getPetCheckIns(petId, 1000);

    if (hostId) {
      // Filter check-ins for the specified host
      count = checkIns.filter(checkIn => checkIn.hid === hostId).length;
    } else {
      // Count all check-ins
      count = checkIns.length;
    }

    return NextResponse.json({ count });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error counting check-ins for pet ${petId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to count pet check-ins' },
      { status: 500 }
    );
  }
}
