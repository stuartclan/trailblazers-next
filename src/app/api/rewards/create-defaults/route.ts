import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// Create default global rewards
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

    // Only super-admins can create default rewards
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Create default global rewards
    const globalRewards = await repositories.rewards.createDefaultGlobalRewardsIfNoneExist();

    // Create default pet rewards
    // const petRewards = await repositories.rewards.createDefaultPetRewardsIfNoneExist();

    return NextResponse.json({
      global: globalRewards,
      pet: petRewards
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating default rewards:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create default rewards' },
      { status: 500 }
    );
  }
}
