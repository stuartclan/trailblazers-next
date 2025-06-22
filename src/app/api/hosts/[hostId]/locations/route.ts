import { NextRequest, NextResponse } from 'next/server';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// Get locations for a host
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hostId: string }> },
) {
  const { hostId } = await params;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated && !isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get host to verify it exists
    const host = await repositories.hosts.getHostById(hostId);
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      );
    }

    // If not super-admin, check if user is this host
    if (!isSuperAdmin(authResult) && isHost(authResult)) {
      // Get the host associated with the Cognito user
      const cognitoId = authResult.userId;
      const userHost = await repositories.hosts.getHostByCognitoId(cognitoId || '');

      if (!userHost || userHost.id !== hostId) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Get locations for this host
    const locations = await repositories.locations.getLocationsByHostId(hostId);

    return NextResponse.json(locations);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error fetching locations for host ${hostId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch host locations' },
      { status: 500 }
    );
  }
}

// Create a new location
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hostId: string }> },
) {
  const { hostId } = await params;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super-admins can create locations
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if host exists
    const host = await repositories.hosts.getHostById(hostId);
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      );
    }

    // Create location
    const location = await repositories.locations.createLocation({
      hostId: hostId,
      name: body.name,
      address: body.address,
      activityIds: body.activityIds || []
    });

    // Update host with new location ID
    await repositories.hosts.addLocationToHost(hostId, location.id);

    return NextResponse.json(location);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create location' },
      { status: 500 }
    );
  }
}
