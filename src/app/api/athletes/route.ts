import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

// List athletes (paginated)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const cursor = searchParams.get('cursor') || undefined;
    
    // Get athletes
    const result = await repositories.athletes.getAllAthletes(limit, cursor ? JSON.parse(cursor) : undefined);
    
    return NextResponse.json({
      athletes: result.athletes,
      nextCursor: result.lastEvaluatedKey ? JSON.stringify(result.lastEvaluatedKey) : undefined
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching athletes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch athletes' },
      { status: 500 }
    );
  }
}

// Create a new athlete
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }
    
    // Create athlete
    const athlete = await repositories.athletes.createAthlete({
      firstName: body.firstName,
      lastName: body.lastName,
      middleInitial: body.middleInitial,
      email: body.email,
      employer: body.employer,
      shirtGender: body.shirtGender,
      shirtSize: body.shirtSize,
      emergencyName: body.emergencyName,
      emergencyPhone: body.emergencyPhone,
      legacyCount: body.legacyCount
    });
    
    return NextResponse.json(athlete);
  } catch (error: any) {
    console.error('Error creating athlete:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create athlete' },
      { status: 500 }
    );
  }
}