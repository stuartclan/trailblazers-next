import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// List all pets (for super-admin)
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
    
    // Only super-admins can list all pets
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const cursor = searchParams.get('cursor') || undefined;
    
    // Get pets
    const result = await repositories.pets.getAllPets(limit, cursor ? JSON.parse(cursor) : undefined);
    
    return NextResponse.json({
      pets: result.pets,
      nextCursor: result.lastEvaluatedKey ? JSON.stringify(result.lastEvaluatedKey) : undefined
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching pets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pets' },
      { status: 500 }
    );
  }
}

// Create a new pet
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
    if (!body.athleteId || !body.name) {
      return NextResponse.json(
        { error: 'Athlete ID and name are required' },
        { status: 400 }
      );
    }
    
    // Check if athlete exists
    const athlete = await repositories.athletes.getAthleteById(body.athleteId);
    if (!athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      );
    }
    
    // Check if pet with the same name already exists for this athlete
    const existingPet = await repositories.pets.getPetByNameAndAthleteId(body.name, body.athleteId);
    if (existingPet) {
      return NextResponse.json(
        { error: 'A pet with this name already exists for this athlete' },
        { status: 400 }
      );
    }
    
    // Create pet
    const pet = await repositories.pets.createPet({
      athleteId: body.athleteId,
      name: body.name
    });
    
    return NextResponse.json(pet);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating pet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create pet' },
      { status: 500 }
    );
  }
}