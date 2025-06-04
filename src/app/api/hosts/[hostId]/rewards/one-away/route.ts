// src/app/api/hosts/[hostId]/rewards/one-away/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

export async function GET(
  request: NextRequest,
  { params }: { params: { hostId: string } }
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
    
    const hostId = params.hostId;
    
    // Check permissions
    if (!isSuperAdmin(authResult) && isHost(authResult)) {
      const cognitoId = authResult.userId;
      const userHost = await repositories.hosts.getHostByCognitoId(cognitoId || '');
      
      if (!userHost || userHost.id !== hostId) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }
    
    // Get all rewards
    const globalRewards = await repositories.rewards.getGlobalRewards();
    const hostRewards = await repositories.rewards.getHostRewards(hostId);
    
    // Get recent check-ins for this host (last 30 days for efficiency)
    const recentCheckIns = await repositories.checkins.getHostCheckIns(hostId, 1000);
    
    // Group check-ins by athlete
    const athleteCheckInCounts = new Map<string, number>();
    recentCheckIns.forEach(checkIn => {
      const current = athleteCheckInCounts.get(checkIn.aid) || 0;
      athleteCheckInCounts.set(checkIn.aid, current + 1);
    });
    
    // Get all reward claims to exclude already claimed rewards
    const allRewardClaims = await Promise.all(
      Array.from(athleteCheckInCounts.keys()).map(athleteId =>
        repositories.rewardClaims.getAthleteRewardClaims(athleteId)
      )
    );
    
    const claimedRewards = new Set<string>();
    allRewardClaims.flat().forEach(claim => {
      claimedRewards.add(`${claim.aid}-${claim.rid}`);
    });
    
    // Find one-away athletes for global rewards
    const globalOneAway: {
      athleteId: string;
      rewardId: string;
      currentCount: number;
      requiredCount: number;
    }[] = [];
    
    globalRewards.forEach(reward => {
      athleteCheckInCounts.forEach((count, athleteId) => {
        const claimKey = `${athleteId}-${reward.id}`;
        if (!claimedRewards.has(claimKey) && count === reward.cnt - 1) {
          globalOneAway.push({
            athleteId,
            rewardId: reward.id,
            currentCount: count,
            requiredCount: reward.cnt
          });
        }
      });
    });
    
    // Find one-away athletes for host rewards
    const hostOneAway: {
      athleteId: string;
      rewardId: string;
      currentCount: number;
      requiredCount: number;
    }[] = [];
    
    hostRewards.forEach(reward => {
      athleteCheckInCounts.forEach((count, athleteId) => {
        const claimKey = `${athleteId}-${reward.id}`;
        if (!claimedRewards.has(claimKey) && count === reward.cnt - 1) {
          hostOneAway.push({
            athleteId,
            rewardId: reward.id,
            currentCount: count,
            requiredCount: reward.cnt
          });
        }
      });
    });
    
    return NextResponse.json({
      globalOneAway,
      hostOneAway
    });
    
  } catch (error: any) {
    console.error(`Error fetching one-away athletes for host ${params.hostId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch one-away athletes' },
      { status: 500 }
    );
  }
}