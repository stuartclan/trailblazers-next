import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

// Get global rewards
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get global rewards
    const rewards = await repositories.rewards.getGlobalRewards();
    
    return NextResponse.json(rewards);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching global rewards:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch global rewards' },
      { status: 500 }
    );
  }
}