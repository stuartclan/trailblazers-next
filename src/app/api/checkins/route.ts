import { NextRequest, NextResponse } from 'next/server';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { getStartOfWeekUnix } from '@/lib/utils/dates';
import { repositories } from '@/lib/db/repository';

// Create a new check-in
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
    if (!body.athleteId || !body.hostId || !body.locationId || !body.activityId) {
      return NextResponse.json(
        { error: 'athleteId, hostId, locationId, and activityId are required' },
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
    
    // Check if activity exists and is enabled for the location
    const activity = await repositories.activities.getActivityById(body.activityId);
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    
    if (!activity.en) {
      return NextResponse.json(
        { error: 'Activity is not enabled' },
        { status: 400 }
      );
    }
    
    if (!location.acts.includes(body.activityId)) {
      return NextResponse.json(
        { error: 'Activity is not available at the specified location' },
        { status: 400 }
      );
    }
    
    // Check if athlete has already checked in at this host this week
    const startOfWeek = getStartOfWeekUnix();
    const endOfWeek = startOfWeek + (7 * 24 * 60 * 60); // 7 days in seconds
    
    const recentCheckIns = await repositories.checkins.getAthleteCheckInsByHostInDateRange(
      body.athleteId,
      body.hostId,
      startOfWeek * 1000,  // Convert to milliseconds
      endOfWeek * 1000     // Convert to milliseconds
    );
    
    if (recentCheckIns.length > 0) {
      return NextResponse.json(
        { error: 'Athlete has already checked in at this host this week' },
        { status: 400 }
      );
    }
    
    // Check if athlete has signed the disclaimer for this host
    const hasSignedDisclaimer = await repositories.athletes.hasSignedDisclaimer(body.athleteId, body.hostId);
    if (!hasSignedDisclaimer) {
      return NextResponse.json(
        { error: 'Athlete has not signed the disclaimer for this host', requiresDisclaimer: true },
        { status: 400 }
      );
    }
    
    // Create check-in
    const checkIn = await repositories.checkins.createCheckIn({
      athleteId: body.athleteId,
      hostId: body.hostId,
      locationId: body.locationId,
      activityId: body.activityId,
      timestamp: body.timestamp || Date.now()
    });
    
    return NextResponse.json(checkIn);
  } catch (error: any) {
    console.error('Error creating check-in:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create check-in' },
      { status: 500 }
    );
  }
}