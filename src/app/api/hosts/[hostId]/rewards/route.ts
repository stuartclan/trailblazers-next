import { NextRequest, NextResponse } from 'next/server';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// Get rewards for a host
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hostId: string }> },
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
    
    // Get rewards for this host
    const rewards = await repositories.rewards.getHostRewards(hostId);
    
    return NextResponse.json(rewards);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error fetching rewards for host ${params.hostId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch host rewards' },
      { status: 500 }
    );
  }
}

// Create a new reward for a host
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hostId: string }> },
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
    
    const { hostId } = await params;
    
    // Get host to verify it exists
    const host = await repositories.hosts.getHostById(hostId);
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
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
      const userHost = await repositories.hosts.getHostByCognitoId(cognitoId || '');
      
      if (userHost && userHost.id === hostId) {
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
    if (!body.count || !body.name || !body.icon) {
      return NextResponse.json(
        { error: 'count, name, and icon are required' },
        { status: 400 }
      );
    }
    
    // Create reward
    const reward = await repositories.rewards.createReward({
      count: body.count,
      name: body.name,
      icon: body.icon,
      type: 'host',
      hostId
    });
    
    return NextResponse.json(reward);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error creating reward for host ${params.hostId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to create host reward' },
      { status: 500 }
    );
  }
}