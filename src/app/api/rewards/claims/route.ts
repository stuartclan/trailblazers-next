import { NextRequest, NextResponse } from 'next/server';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// Create a new reward claim
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
    
    // Ensure user is a host or super-admin
    if (!isHost(authResult) && !isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.athleteId || !body.rewardId || !body.hostId || !body.locationId) {
      return NextResponse.json(
        { error: 'athleteId, rewardId, hostId, and locationId are required' },
        { status: 400 }
      );
    }
    
    // Check if athlete exists
    const athlete = await repositories.athletes.getAthleteById(body.athleteId);
    if (!athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      );
    }
    
    // Check if reward exists
    const reward = await repositories.rewards.getRewardById(body.rewardId);
    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }
    
    // Check if host exists
    const host = await repositories.hosts.getHostById(body.hostId);
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      );
    }
    
    // Check if location exists and belongs to the host
    const location = await repositories.locations.getLocationById(body.locationId);
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }
    
    if (location.hid !== body.hostId) {
      return NextResponse.json(
        { error: 'Location does not belong to the specified host' },
        { status: 400 }
      );
    }
    
    // For host-specific rewards, ensure the reward belongs to this host
    if (reward.rt === 'host' && reward.hid !== body.hostId) {
      return NextResponse.json(
        { error: 'Host-specific reward does not belong to the claiming host' },
        { status: 400 }
      );
    }
    
    // If user is a host (not super-admin), make sure they are the host being used
    if (isHost(authResult) && !isSuperAdmin(authResult)) {
      const cognitoId = authResult.userId;
      const userHost = await repositories.hosts.getHostByCognitoId(cognitoId || '');
      
      if (!userHost || userHost.id !== body.hostId) {
        return NextResponse.json(
          { error: 'Host can only claim rewards at their own locations' },
          { status: 403 }
        );
      }
    }
    
    // For pet rewards, check if pet exists and belongs to athlete
    if (reward.rt === 'pet') {
      if (!body.petId) {
        return NextResponse.json(
          { error: 'petId is required for pet rewards' },
          { status: 400 }
        );
      }
      
      const pet = await repositories.pets.getPetById(body.petId);
      if (!pet) {
        return NextResponse.json(
          { error: 'Pet not found' },
          { status: 404 }
        );
      }
      
      if (pet.aid !== body.athleteId) {
        return NextResponse.json(
          { error: 'Pet does not belong to the specified athlete' },
          { status: 400 }
        );
      }
    }
    
    // Create reward claim
    const rewardClaim = await repositories.rewardClaims.createRewardClaim({
      athleteId: body.athleteId,
      rewardId: body.rewardId,
      hostId: body.hostId,
      locationId: body.locationId,
      petId: body.petId // Only used for pet rewards
    });
    
    return NextResponse.json(rewardClaim);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating reward claim:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create reward claim' },
      { status: 500 }
    );
  }
}