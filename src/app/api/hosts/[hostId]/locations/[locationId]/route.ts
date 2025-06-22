/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// Get a specific location
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

    // Get location
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
      // Could use hostId param, but this validates with cognito user
      const host = await repositories.hosts.getHostByCognitoId(cognitoId || '');

      if (!host || !host.lids.includes(locationId)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(location);
  } catch (error: any) {
    console.error(`Error fetching location ${locationId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

// Update a location
export async function PATCH(
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

    // Only super-admins can update locations
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if location exists
    const location = await repositories.locations.getLocationById(locationId);
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // // Validate host ID if it's being updated
    // if (body.hostId && hostId !== location.hid) {
    //   const newHost = await repositories.hosts.getHostById(body.hostId);
    //   if (!newHost) {
    //     return NextResponse.json(
    //       { error: 'New host not found' },
    //       { status: 404 }
    //     );
    //   }

    //   // Remove location from old host
    //   await repositories.hosts.removeLocationFromHost(location.hid, locationId);

    //   // Add location to new host
    //   await repositories.hosts.addLocationToHost(body.hostId, locationId);
    // }

    // Update location
    const updatedLocation = await repositories.locations.updateLocation(locationId, {
      n: body.name,
      a: body.address,
      acts: body.activityIds
    });

    return NextResponse.json(updatedLocation);
  } catch (error: any) {
    console.error(`Error updating location ${locationId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update location' },
      { status: 500 }
    );
  }
}

// Delete a location
export async function DELETE(
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

    // Only super-admins can delete locations
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if location exists
    const location = await repositories.locations.getLocationById(locationId);
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // Remove location from host
    await repositories.hosts.removeLocationFromHost(location.hid, locationId);

    // Delete location
    await repositories.locations.deleteLocation(locationId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error deleting location ${locationId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete location' },
      { status: 500 }
    );
  }
}
