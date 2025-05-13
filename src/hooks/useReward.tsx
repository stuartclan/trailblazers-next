'use client';

import type { RewardClaimEntity, RewardEntity } from '@/lib/db/entities/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// API client functions
const fetchReward = async (rewardId: string): Promise<RewardEntity> => {
  const response = await fetch(`/api/rewards/${rewardId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reward');
  }
  return response.json();
};

const fetchGlobalRewards = async (): Promise<RewardEntity[]> => {
  const response = await fetch('/api/rewards/global');
  if (!response.ok) {
    throw new Error('Failed to fetch global rewards');
  }
  return response.json();
};

const fetchPetRewards = async (): Promise<RewardEntity[]> => {
  const response = await fetch('/api/rewards/pet');
  if (!response.ok) {
    throw new Error('Failed to fetch pet rewards');
  }
  return response.json();
};

const fetchHostRewards = async (hostId: string): Promise<RewardEntity[]> => {
  const response = await fetch(`/api/hosts/${hostId}/rewards`);
  if (!response.ok) {
    throw new Error('Failed to fetch host rewards');
  }
  return response.json();
};

const createReward = async (data: {
  count: number;
  name: string;
  icon: string;
  type: 'global' | 'host' | 'pet';
  hostId?: string;
}): Promise<RewardEntity> => {
  const response = await fetch('/api/rewards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create reward');
  }
  
  return response.json();
};

const updateReward = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Omit<RewardEntity, 'pk' | 'sk' | 't' | 'id' | 'c' | 'rt' | 'GSI1PK' | 'GSI1SK'>>;
}): Promise<RewardEntity> => {
  const response = await fetch(`/api/rewards/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update reward');
  }
  
  return response.json();
};

const deleteReward = async (id: string): Promise<void> => {
  const response = await fetch(`/api/rewards/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete reward');
  }
};

const fetchRewardClaims = async (athleteId: string): Promise<RewardClaimEntity[]> => {
  const response = await fetch(`/api/athletes/${athleteId}/rewards/claims`);
  if (!response.ok) {
    throw new Error('Failed to fetch reward claims');
  }
  return response.json();
};

const fetchHostRewardClaims = async (hostId: string, limit = 50): Promise<RewardClaimEntity[]> => {
  const response = await fetch(`/api/hosts/${hostId}/rewards/claims?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch host reward claims');
  }
  return response.json();
};

const createRewardClaim = async (data: {
  athleteId: string;
  rewardId: string;
  hostId: string;
  locationId: string;
  petId?: string;
}): Promise<RewardClaimEntity> => {
  const response = await fetch('/api/rewards/claims', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create reward claim');
  }
  
  return response.json();
};

const checkRewardEligibility = async (data: {
  athleteId: string;
  hostId?: string;
}): Promise<{
  globalRewards: { rewardId: string; count: number }[];
  hostRewards: { rewardId: string; count: number }[];
}> => {
  let url = `/api/athletes/${data.athleteId}/rewards/eligibility`;
  if (data.hostId) {
    url += `?hostId=${data.hostId}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to check reward eligibility');
  }
  
  return response.json();
};

const checkPetRewardEligibility = async (data: {
  petId: string;
  hostId?: string;
}): Promise<{
  petRewards: { rewardId: string; count: number }[];
}> => {
  let url = `/api/pets/${data.petId}/rewards/eligibility`;
  if (data.hostId) {
    url += `?hostId=${data.hostId}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to check pet reward eligibility');
  }
  
  return response.json();
};

// Function to get athletes that are "one-away" from rewards at a specific host
const getOneAwayAthletes = async (hostId: string): Promise<{
  globalOneAway: { athleteId: string; rewardId: string; currentCount: number; requiredCount: number }[];
  hostOneAway: { athleteId: string; rewardId: string; currentCount: number; requiredCount: number }[];
}> => {
  const response = await fetch(`/api/hosts/${hostId}/rewards/one-away`);
  if (!response.ok) {
    throw new Error('Failed to fetch one-away athletes');
  }
  
  return response.json();
};

// React Query Hooks
export const useReward = (rewardId: string) => {
  return useQuery({
    queryKey: ['rewards', rewardId],
    queryFn: () => fetchReward(rewardId),
    enabled: !!rewardId,
  });
};

export const useGlobalRewards = () => {
  return useQuery({
    queryKey: ['rewards', 'global'],
    queryFn: fetchGlobalRewards,
  });
};

export const usePetRewards = () => {
  return useQuery({
    queryKey: ['rewards', 'pet'],
    queryFn: fetchPetRewards,
  });
};

export const useHostRewards = (hostId: string) => {
  return useQuery({
    queryKey: ['rewards', 'host', hostId],
    queryFn: () => fetchHostRewards(hostId),
    enabled: !!hostId,
  });
};

export const useCreateReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createReward,
    onSuccess: (data) => {
      if (data.rt === 'global') {
        queryClient.invalidateQueries({ queryKey: ['rewards', 'global'] });
      } else if (data.rt === 'pet') {
        queryClient.invalidateQueries({ queryKey: ['rewards', 'pet'] });
      } else if (data.rt === 'host' && data.hid) {
        queryClient.invalidateQueries({ queryKey: ['rewards', 'host', data.hid] });
      }
      
      queryClient.invalidateQueries({ queryKey: ['rewards', data.id] });
    },
  });
};

export const useUpdateReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateReward,
    onSuccess: (data) => {
      if (data.rt === 'global') {
        queryClient.invalidateQueries({ queryKey: ['rewards', 'global'] });
      } else if (data.rt === 'pet') {
        queryClient.invalidateQueries({ queryKey: ['rewards', 'pet'] });
      } else if (data.rt === 'host' && data.hid) {
        queryClient.invalidateQueries({ queryKey: ['rewards', 'host', data.hid] });
      }
      
      queryClient.invalidateQueries({ queryKey: ['rewards', data.id] });
    },
  });
};

export const useDeleteReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteReward,
    onSuccess: (_data, variables) => {
      // We need the reward data to know which queries to invalidate
      // Fortunately, it should be in the cache
      const reward = queryClient.getQueryData<RewardEntity>(['rewards', variables]);
      
      if (reward) {
        if (reward.rt === 'global') {
          queryClient.invalidateQueries({ queryKey: ['rewards', 'global'] });
        } else if (reward.rt === 'pet') {
          queryClient.invalidateQueries({ queryKey: ['rewards', 'pet'] });
        } else if (reward.rt === 'host' && reward.hid) {
          queryClient.invalidateQueries({ queryKey: ['rewards', 'host', reward.hid] });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['rewards', variables] });
    },
  });
};

export const useRewardClaims = (athleteId: string) => {
  return useQuery({
    queryKey: ['rewards', 'claims', athleteId],
    queryFn: () => fetchRewardClaims(athleteId),
    enabled: !!athleteId,
  });
};

export const useHostRewardClaims = (hostId: string, limit = 50) => {
  return useQuery({
    queryKey: ['rewards', 'claims', 'host', hostId, { limit }],
    queryFn: () => fetchHostRewardClaims(hostId, limit),
    enabled: !!hostId,
  });
};

export const useCreateRewardClaim = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRewardClaim,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rewards', 'claims', data.aid] });
      queryClient.invalidateQueries({ queryKey: ['rewards', 'claims', 'host', data.hid] });
      queryClient.invalidateQueries({ queryKey: ['rewards', 'eligibility', data.aid] });
      
      // If this is a pet reward claim
      if (data.pid) {
        queryClient.invalidateQueries({ queryKey: ['rewards', 'eligibility', 'pet', data.pid] });
      }
      
      // Invalidate one-away queries
      queryClient.invalidateQueries({ queryKey: ['rewards', 'one-away', data.hid] });
    },
  });
};

export const useRewardEligibility = (athleteId: string, hostId?: string) => {
  return useQuery({
    queryKey: ['rewards', 'eligibility', athleteId, { hostId }],
    queryFn: () => checkRewardEligibility({ athleteId, hostId }),
    enabled: !!athleteId,
  });
};

export const usePetRewardEligibility = (petId: string, hostId?: string) => {
  return useQuery({
    queryKey: ['rewards', 'eligibility', 'pet', petId, { hostId }],
    queryFn: () => checkPetRewardEligibility({ petId, hostId }),
    enabled: !!petId,
  });
};

export const useOneAwayAthletes = (hostId: string) => {
  return useQuery({
    queryKey: ['rewards', 'one-away', hostId],
    queryFn: () => getOneAwayAthletes(hostId),
    enabled: !!hostId,
  });
};