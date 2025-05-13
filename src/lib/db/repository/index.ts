import { ActivityRepository } from './activity-repository';
import { AthleteRepository } from './athlete-repository';
import { CheckInRepository } from './checkin-repository';
import { HostRepository } from './host-repository';
import { LocationRepository } from './location-repository';
import { PetRepository } from './pet-repository';
import { RewardClaimRepository } from './reward-claim-repository';
import { RewardRepository } from './reward-repository';

// Export all repositories
export {
  HostRepository,
  LocationRepository,
  AthleteRepository,
  ActivityRepository,
  PetRepository,
  CheckInRepository,
  RewardRepository,
  RewardClaimRepository
};

// Export a factory function to create all repositories
export function createRepositories() {
  return {
    hosts: new HostRepository(),
    locations: new LocationRepository(),
    athletes: new AthleteRepository(),
    activities: new ActivityRepository(),
    pets: new PetRepository(),
    checkins: new CheckInRepository(),
    rewards: new RewardRepository(),
    rewardClaims: new RewardClaimRepository()
  };
}

// Create a default repositories object
export const repositories = createRepositories();