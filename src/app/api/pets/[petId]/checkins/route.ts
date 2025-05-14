import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

// Get check-ins for a pet
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    // Get check-ins for this pet
    const checkIns = await repositories.checkins.getPetCheckIns(petId, limit);
    
    return NextResponse.json(checkIns);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error fetching check-ins for pet ${params.petId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pet check-ins' },
      { status: 500 }
    );
  }
}