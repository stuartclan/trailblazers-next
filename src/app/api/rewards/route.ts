import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// Create a new reward
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
    
    // Only super-admins can create global or pet rewards
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.count || !body.name || !body.icon || !body.type) {
      return NextResponse.json(
        { error: 'count, name, icon, and type are required' },
        { status: 400 }
      );
    }
    
    // Validate reward type
    if (!['global', 'pet', 'host'].includes(body.type)) {
      return NextResponse.json(
        { error: 'type must be one of: global, pet, host' },
        { status: 400 }
      );
    }
    
    // If type is host, hostId is required
    if (body.type === 'host' && !body.hostId) {
      return NextResponse.json(
        { error: 'hostId is required for host-type rewards' },
        { status: 400 }
      );
    }
    
    // If hostId is provided, check if host exists
    if (body.hostId) {
      const host = await repositories.hosts.getHostById(body.hostId);
      if (!host) {
        return NextResponse.json(
          { error: 'Host not found' },
          { status: 404 }
        );
      }
    }
    
    // Create reward
    const reward = await repositories.rewards.createReward({
      count: body.count,
      name: body.name,
      icon: body.icon,
      type: body.type,
      hostId: body.hostId
    });
    
    return NextResponse.json(reward);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create reward' },
      { status: 500 }
    );
  }
}