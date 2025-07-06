// src/hooks/useReward.tsx
'use client';

import type { RewardClaimEntity, RewardEntity } from '@/lib/db/entities/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/utils/api-client';

// API client functions using the new authenticated client
const fetchReward = async (rewardId: string): Promise<RewardEntity> => {
  const response = await apiClient.get<RewardEntity>(`/api/rewards/${rewardId}`);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const fetchGlobalRewards = async (): Promise<RewardEntity[]> => {
  const response = await apiClient.get<RewardEntity[]>('/api/rewards/global');

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!.sort((a, b) => a.cnt - b.cnt);
};

const fetchPetRewards = async (): Promise<RewardEntity[]> => {
  const response = await apiClient.get<RewardEntity[]>('/api/rewards/pet');

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const fetchHostRewards = async (hostId: string): Promise<RewardEntity[]> => {
  const response = await apiClient.get<RewardEntity[]>(`/api/hosts/${hostId}/rewards`);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const createReward = async (data: {
  count: number;
  name: string;
  icon: string;
  type: 'global' | 'host' | 'pet';
  hostId?: string;
}): Promise<RewardEntity> => {
  const response = await apiClient.post<RewardEntity>('/api/rewards', data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const updateReward = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Omit<RewardEntity, 'pk' | 'sk' | 't' | 'id' | 'c' | 'rt' | 'GSI1PK' | 'GSI1SK'>>;
}): Promise<RewardEntity> => {
  const response = await apiClient.patch<RewardEntity>(`/api/rewards/${id}`, data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const deleteReward = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/api/rewards/${id}`);

  if (response.error) {
    throw new Error(response.error);
  }
};

const fetchRewardClaims = async (athleteId: string): Promise<RewardClaimEntity[]> => {
  const response = await apiClient.get<RewardClaimEntity[]>(`/api/athletes/${athleteId}/rewards/claims`);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const fetchHostRewardClaims = async (hostId: string, limit = 50): Promise<RewardClaimEntity[]> => {
  const response = await apiClient.get<RewardClaimEntity[]>(
    `/api/hosts/${hostId}/rewards/claims?limit=${limit}`
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const createRewardClaim = async (data: {
  athleteId: string;
  rewardId: string;
  hostId: string;
  locationId: string;
  petId?: string;
}): Promise<RewardClaimEntity> => {
  const response = await apiClient.post<RewardClaimEntity>('/api/rewards/claims', data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
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

  const response = await apiClient.get<{
    globalRewards: { rewardId: string; count: number }[];
    hostRewards: { rewardId: string; count: number }[];
  }>(url);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
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

  const response = await apiClient.get<{
    petRewards: { rewardId: string; count: number }[];
  }>(url);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

// Function to get athletes that are "one-away" from rewards at a specific host
const getOneAwayAthletes = async (hostId: string): Promise<{
  globalOneAway: { athleteId: string; rewardId: string; currentCount: number; requiredCount: number }[];
  hostOneAway: { athleteId: string; rewardId: string; currentCount: number; requiredCount: number }[];
}> => {
  const response = await apiClient.get<{
    globalOneAway: { athleteId: string; rewardId: string; currentCount: number; requiredCount: number }[];
    hostOneAway: { athleteId: string; rewardId: string; currentCount: number; requiredCount: number }[];
  }>(`/api/hosts/${hostId}/rewards/one-away`);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const createDefaultRewards = async (): Promise<{
  global: RewardEntity[];
  pet: RewardEntity[];
}> => {
  const response = await apiClient.post<{
    global: RewardEntity[];
    pet: RewardEntity[];
  }>('/api/rewards/create-defaults');

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
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
    // onMutate(variables) {
    //   const reward = queryClient.getQueryData<RewardEntity>(['rewards', variables]);
    // },
    mutationFn: deleteReward,
    onSuccess: (_data, variables) => {
      // We need the reward data to know which queries to invalidate
      // Unfortunately, it isn't in the cache to pull out - so just invalidate all queries
      queryClient.invalidateQueries({ queryKey: ['rewards', 'global'] });
      queryClient.invalidateQueries({ queryKey: ['rewards', 'pet'] });
      // If we use this for host reward deletion, we'll need to handle this differently
      // queryClient.invalidateQueries({ queryKey: ['rewards', 'host', reward.hid] });
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

export const useCreateDefaultRewards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDefaultRewards,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards', 'global'] });
      queryClient.invalidateQueries({ queryKey: ['rewards', 'pet'] });
    },
  });
};
