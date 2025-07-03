import { NextRequest, NextResponse } from 'next/server';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { CheckInHelper } from '@/lib/utils/helpers/checkin';
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

    // Fetch all required entities in parallel
    const [athlete, host, location, activity] = await Promise.all([
      repositories.athletes.getAthleteById(body.athleteId),
      repositories.hosts.getHostById(body.hostId),
      repositories.locations.getLocationById(body.locationId),
      repositories.activities.getActivityById(body.activityId)
    ]);

    // Check if athlete exists
    if (!athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      );
    }

    // Check if host exists
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      );
    }

    // Check if location exists and belongs to the host
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

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if activity exists and is enabled for the location
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

    // Use the lw property to check eligibility
    if (!CheckInHelper.canCheckInAtHost(athlete, body.hostId)) {
      return NextResponse.json(
        { error: 'Athlete has already checked in at this host this week' },
        { status: 400 }
      );
    }

    // Check if athlete has signed the disclaimer for this host
    // This is already efficiently stored on the athlete entity
    if (!athlete.ds[body.hostId]) {
      return NextResponse.json(
        { error: 'Athlete has not signed the disclaimer for this host', requiresDisclaimer: true },
        { status: 400 }
      );
    }

    // Determine if we should increment global count
    const shouldIncrementGlobalCount = CheckInHelper.shouldIncrementGlobalCount(athlete);

    // Create check-in timestamp
    const checkInTimestamp = body.timestamp || Date.now();

    // Create the check-in record and update athlete optimization properties atomically
    const [checkIn] = await Promise.all([
      repositories.checkins.createCheckIn({
        athleteId: body.athleteId,
        hostId: body.hostId,
        locationId: body.locationId,
        activityId: body.activityId,
        timestamp: checkInTimestamp
      }),
      repositories.athletes.updateAfterCheckIn(
        body.athleteId,
        body.hostId,
        checkInTimestamp,
        body.activityId,
        shouldIncrementGlobalCount
      )
    ]);

    return NextResponse.json(checkIn);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating check-in:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create check-in' },
      { status: 500 }
    );
  }
}
