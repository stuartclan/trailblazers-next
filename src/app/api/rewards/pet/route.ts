import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

// Get pet rewards
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
    
    // Get pet rewards
    const rewards = await repositories.rewards.getPetRewards();
    
    return NextResponse.json(rewards);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching pet rewards:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pet rewards' },
      { status: 500 }
    );
  }
}