/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// Get a specific activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> },
) {
  const { activityId } = await params;

  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get activity
    const activity = await repositories.activities.getActivityById(activityId);
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error: any) {
    console.error(`Error fetching activity ${activityId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

// Update an activity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> },
) {
  const { activityId } = await params;

  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super-admins can update activities
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if activity exists
    const activity = await repositories.activities.getActivityById(activityId);
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const updates = await request.json();

    // Update activity
    const updatedActivity = await repositories.activities.updateActivity(activityId, updates);

    return NextResponse.json(updatedActivity);
  } catch (error: any) {
    console.error(`Error updating activity ${activityId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// Delete an activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> },
) {
  const { activityId } = await params;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super-admins can delete activities
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if activity exists
    const activity = await repositories.activities.getActivityById(activityId);
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // TODO: Check if activity is in use by any locations
    // This would require scanning all locations for this activity
    // For now, we'll just proceed with deletion

    // Delete activity
    await repositories.activities.deleteActivity(activityId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error deleting activity ${activityId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete activity' },
      { status: 500 }
    );
  }
}
