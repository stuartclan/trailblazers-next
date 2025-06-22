import { NextRequest, NextResponse } from 'next/server';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// Get activities for a location
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get location to verify it exists
    const location = await repositories.locations.getLocationById(locationId);
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // If not super-admin, check if user is associated with this location
    if (!isSuperAdmin(authResult) && isHost(authResult)) {
      // Get the host associated with the Cognito user
      const cognitoId = authResult.userId;
      // Could pull hostId from url param, but this authorizes the host with the cognito user
      const host = await repositories.hosts.getHostByCognitoId(cognitoId || '');

      if (!host || !host.lids.includes(locationId)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Get the activity IDs from the location
    const activityIds = location.acts || [];

    // Fetch full activity objects
    const activities = await repositories.activities.getActivitiesByIds(activityIds);

    return NextResponse.json(activities);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error fetching activities for location ${locationId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch location activities' },
      { status: 500 }
    );
  }
}

// Update activities for a location
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get location to verify it exists
    const location = await repositories.locations.getLocationById(locationId);
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // Check permissions
    let hasPermission = false;

    if (isSuperAdmin(authResult)) {
      hasPermission = true;
    } else if (isHost(authResult)) {
      // Get the host associated with the Cognito user
      const cognitoId = authResult.userId;
      const host = await repositories.hosts.getHostByCognitoId(cognitoId || '');

      if (host && host.lids.includes(locationId)) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.activityIds || !Array.isArray(body.activityIds)) {
      return NextResponse.json(
        { error: 'Activity IDs array is required' },
        { status: 400 }
      );
    }

    // Verify all activities exist and are enabled
    const activityIds = body.activityIds;

    // Limit to maximum 3 activities
    if (activityIds.length > 3) {
      return NextResponse.json(
        { error: 'Maximum 3 activities allowed per location' },
        { status: 400 }
      );
    }

    // Verify all activities exist and are enabled
    for (const activityId of activityIds) {
      const activity = await repositories.activities.getActivityById(activityId);
      if (!activity) {
        return NextResponse.json(
          { error: `Activity ${activityId} not found` },
          { status: 404 }
        );
      }

      if (!activity.en) {
        return NextResponse.json(
          { error: `Activity ${activityId} is not enabled` },
          { status: 400 }
        );
      }
    }

    // Update location activities
    const updatedLocation = await repositories.locations.updateLocationActivities(locationId, activityIds);

    return NextResponse.json(updatedLocation);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error updating activities for location ${locationId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update location activities' },
      { status: 500 }
    );
  }
}
