/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

// Get a specific pet
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

    // Get pet
    const pet = await repositories.pets.getPetById(petId);
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pet);
  } catch (error: any) {
    console.error(`Error fetching pet ${petId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pet' },
      { status: 500 }
    );
  }
}

// Update a pet
export async function PATCH(
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

    // Parse request body
    const body = await request.json();

    // Only allow updating name for now
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if another pet with the same name already exists for this athlete
    if (body.name !== pet.n) {
      const existingPet = await repositories.pets.getPetByNameAndAthleteId(body.name, pet.aid);
      if (existingPet) {
        return NextResponse.json(
          { error: 'A pet with this name already exists for this athlete' },
          { status: 400 }
        );
      }
    }

    // Update pet
    const updatedPet = await repositories.pets.updatePet(petId, {
      n: body.name
    });

    return NextResponse.json(updatedPet);
  } catch (error: any) {
    console.error(`Error updating pet ${petId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update pet' },
      { status: 500 }
    );
  }
}

// Delete a pet
export async function DELETE(
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

    // Delete pet
    await repositories.pets.deletePet(petId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error deleting pet ${petId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete pet' },
      { status: 500 }
    );
  }
}
