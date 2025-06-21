/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// Get a specific athlete
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> }
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

    // Get athlete
    const athlete = await repositories.athletes.getAthleteById(athleteId);
    if (!athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(athlete);
  } catch (error: any) {
    console.error(`Error fetching athlete ${athleteId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch athlete' },
      { status: 500 }
    );
  }
}

// Update an athlete
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> }
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

    // Parse request body
    const body = await request.json();

    // Create update data object
    const updateData: any = {};

    // Allow updating specific fields
    if (body.firstName !== undefined) updateData.fn = body.firstName;
    if (body.lastName !== undefined) updateData.ln = body.lastName;
    if (body.middleInitial !== undefined) updateData.mi = body.middleInitial;
    if (body.email !== undefined) updateData.e = body.email;
    if (body.employer !== undefined) updateData.em = body.employer;
    if (body.shirtGender !== undefined) updateData.sg = body.shirtGender;
    if (body.shirtSize !== undefined) updateData.ss = body.shirtSize;
    if (body.emergencyName !== undefined) updateData.en = body.emergencyName;
    if (body.emergencyPhone !== undefined) updateData.ep = body.emergencyPhone;

    // Only super-admins can update legacy count
    if (body.legacyCount !== undefined && isSuperAdmin(authResult)) {
      updateData.lc = body.legacyCount;
    }

    // Update athlete
    const updatedAthlete = await repositories.athletes.updateAthlete(athleteId, updateData);

    return NextResponse.json(updatedAthlete);
  } catch (error: any) {
    console.error(`Error updating athlete ${athleteId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update athlete' },
      { status: 500 }
    );
  }
}

// Delete an athlete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> }
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

    // Only super-admins can delete athletes
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
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

    // Soft delete athlete
    await repositories.athletes.softDeleteAthlete(athleteId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error deleting athlete ${athleteId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete athlete' },
      { status: 500 }
    );
  }
}
