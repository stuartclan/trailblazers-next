/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// Get a specific reward
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rewardId: string }> }
) {
  const { rewardId } = await params;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get reward
    const reward = await repositories.rewards.getRewardById(rewardId);
    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    // If not super-admin and this is a host reward, check if user is this host
    if (!isSuperAdmin(authResult) && reward.rt === 'host' && reward.hid) {
      if (isHost(authResult)) {
        // Get the host associated with the Cognito user
        const cognitoId = authResult.userId;
        const host = await repositories.hosts.getHostByCognitoId(cognitoId || '');

        if (!host || host.id !== reward.hid) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(reward);
  } catch (error: any) {
    console.error(`Error fetching reward ${rewardId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reward' },
      { status: 500 }
    );
  }
}

// Update a reward
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ rewardId: string }> }
) {
  const { rewardId } = await params;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get reward to check its type and verify it exists
    const reward = await repositories.rewards.getRewardById(rewardId);
    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    // Check permissions
    let hasPermission = false;

    if (isSuperAdmin(authResult)) {
      // Super admins can update any reward
      hasPermission = true;
    } else if (isHost(authResult) && reward.rt === 'host' && reward.hid) {
      // Hosts can only update their own rewards
      const cognitoId = authResult.userId;
      const host = await repositories.hosts.getHostByCognitoId(cognitoId || '');

      if (host && host.id === reward.hid) {
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

    // Update reward
    const updatedReward = await repositories.rewards.updateReward(rewardId, {
      cnt: body.count,
      n: body.name,
      i: body.icon
    });

    return NextResponse.json(updatedReward);
  } catch (error: any) {
    console.error(`Error updating reward ${rewardId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update reward' },
      { status: 500 }
    );
  }
}

// Delete a reward
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ rewardId: string }> }
) {
  const { rewardId } = await params;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get reward to check its type and verify it exists
    const reward = await repositories.rewards.getRewardById(rewardId);
    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    // Check permissions
    let hasPermission = false;

    if (isSuperAdmin(authResult)) {
      // Super admins can delete any reward
      hasPermission = true;
    } else if (isHost(authResult) && reward.rt === 'host' && reward.hid) {
      // Hosts can only delete their own rewards
      const cognitoId = authResult.userId;
      const host = await repositories.hosts.getHostByCognitoId(cognitoId || '');

      if (host && host.id === reward.hid) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete reward
    await repositories.rewards.deleteReward(rewardId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error deleting reward ${rewardId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete reward' },
      { status: 500 }
    );
  }
}
