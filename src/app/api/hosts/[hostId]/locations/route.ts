import { NextRequest, NextResponse } from 'next/server';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// Get locations for a host
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hostId: string }> },
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated && !isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { hostId } = await params;
    
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
    console.error(`Error fetching locations for host ${params.hostId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch host locations' },
      { status: 500 }
    );
  }
}