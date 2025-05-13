import { NextRequest, NextResponse } from 'next/server';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { getStartOfWeekUnix } from '@/lib/utils/dates';
import { repositories } from '@/lib/db/repository';

// Create a new pet check-in
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
    
    // Ensure user is a host or super-admin
    if (!isHost(authResult) && !isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.athleteId || !body.petId || !body.hostId || !body.locationId) {
      return NextResponse.json(
        { error: 'athleteId, petId, hostId, and locationId are required' },
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
    
    // Check if pet exists and belongs to the athlete
    const pet = await repositories.pets.getPetById(body.petId);
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }
    
    if (pet.aid !== body.athleteId) {
      return NextResponse.json(
        { error: 'Pet does not belong to the specified athlete' },
        { status: 400 }
      );
    }
    
    // Check if host exists
    const host = await repositories.hosts.getHostById(body.hostId);
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      );
    }
    
    // Check if location exists and belongs to the host
    const location = await repositories.locations.getLocationById(body.locationId);
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }
    
    if (location.hid !== body.hostId) {
      return NextResponse.json(
        { error: 'Location does not belong to the specified host' },
        { status: 400 }
      );
    }
    
    // Check if pet has already checked in at this host this week
    const startOfWeek = getStartOfWeekUnix();
    const endOfWeek = startOfWeek + (7 * 24 * 60 * 60); // 7 days in seconds
    
    // For this check, we'll use the athlete's check-ins at the host
    // since pets can only check-in with their owners
    const recentCheckIns = await repositories.checkins.getAthleteCheckInsByHostInDateRange(
      body.athleteId,
      body.hostId,
      startOfWeek * 1000,  // Convert to milliseconds
      endOfWeek * 1000     // Convert to milliseconds
    );
    
    if (recentCheckIns.length === 0) {
      return NextResponse.json(
        { error: 'Athlete must check in before their pet can check in' },
        { status: 400 }
      );
    }
    
    // Create pet check-in
    const petCheckIn = await repositories.checkins.createPetCheckIn({
      athleteId: body.athleteId,
      petId: body.petId,
      hostId: body.hostId,
      locationId: body.locationId,
      timestamp: body.timestamp || Date.now()
    });
    
    return NextResponse.json(petCheckIn);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating pet check-in:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create pet check-in' },
      { status: 500 }
    );
  }
}