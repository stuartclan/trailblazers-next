import { NextRequest, NextResponse } from 'next/server';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { CheckInHelper } from '@/lib/utils/helpers/checkin';
import { repositories } from '@/lib/db/repository';

// Update a check-in (change activity)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string; timestamp: string }> }
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

    // Ensure user is a host or super-admin
    if (!isHost(authResult) && !isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { athleteId, timestamp: timestampStr } = await params;

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.activityId) {
      return NextResponse.json(
        { error: 'activityId is required' },
        { status: 400 }
      );
    }

    const [athlete, activity] = await Promise.all([
      repositories.athletes.getAthleteById(athleteId),
      repositories.activities.getActivityById(body.activityId)
    ]);

    // Check if athlete exists
    if (!athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      );
    }

    // Check if activity exists
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

    // Parse timestamp
    const timestamp = parseInt(timestampStr);

    // Update the check-in
    const updatedCheckIn = await repositories.checkins.updateCheckIn(
      athleteId,
      timestamp,
      {
        activityId: body.activityId,
        // newTimestamp: body.newTimestamp
      }
    );

    if (!updatedCheckIn) {
      return NextResponse.json(
        { error: 'Check-in not found' },
        { status: 404 }
      );
    }

    // Update last check-in record for this host
    const currentCheckIn = athlete.lw[body.hostId];
    if (currentCheckIn) {
      await repositories.athletes.updateAthlete(athleteId, {
        lw: {
          ...athlete.lw,
          [body.hostId]: `${currentCheckIn.split('#')[0]}#${body.activityId}`,
        }
      });
    }

    return NextResponse.json(updatedCheckIn);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error updating check-in:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update check-in' },
      { status: 500 }
    );
  }
}

// Delete a check-in
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string; timestamp: string }> }
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

    // Ensure user is a host or super-admin
    if (!isHost(authResult) && !isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { athleteId, timestamp } = await params;
    // Parse timestamp
    const timestampMs = parseInt(timestamp);

    const [athlete, checkin] = await Promise.all([
      repositories.athletes.getAthleteById(athleteId),
      repositories.checkins.getCheckIn(athleteId, timestampMs)
    ]);
    // Check if athlete exists
    if (!athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      );
    }

    // In case a duplicate delete call is made
    const hadTimestamp = Object.keys(athlete.lw).includes(checkin?.hid || '');

    // remove host from the week's check-ins
    delete athlete.lw[checkin?.hid || ''];
    // See if there are no more entries for this week
    const shouldDecrement = hadTimestamp && CheckInHelper.shouldIncrementGlobalCount(athlete);

    await Promise.all([
      // Delete the check-in
      repositories.checkins.deleteCheckIn(athleteId, timestampMs),
      // Update last check-in record for this host
      repositories.athletes.updateAthlete(athleteId, {
        ...(shouldDecrement && { gc: athlete.gc - 1 }),
        lw: {
          ...athlete.lw,
        }
      }),
    ]);

    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error deleting check-in:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete check-in' },
      { status: 500 }
    );
  }
}
