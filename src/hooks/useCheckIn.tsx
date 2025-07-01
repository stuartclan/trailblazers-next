// src/hooks/useCheckIn.tsx
'use client';

import type { CheckInEntity, PetCheckInEntity } from '@/lib/db/entities/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/utils/api-client';

// API client functions using the new authenticated client
const fetchAthleteCheckIns = async (athleteId: string, limit = 50): Promise<CheckInEntity[]> => {
  const response = await apiClient.get<CheckInEntity[]>(
    `/api/athletes/${athleteId}/checkins?limit=${limit}`
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const fetchPetCheckIns = async (petId: string, limit = 50): Promise<PetCheckInEntity[]> => {
  const response = await apiClient.get<PetCheckInEntity[]>(
    `/api/pets/${petId}/checkins?limit=${limit}`
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const fetchHostCheckIns = async (hostId: string, limit = 50): Promise<CheckInEntity[]> => {
  const response = await apiClient.get<CheckInEntity[]>(
    `/api/hosts/${hostId}/checkins?limit=${limit}`
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const fetchHostPetCheckIns = async (hostId: string, limit = 50): Promise<PetCheckInEntity[]> => {
  const response = await apiClient.get<PetCheckInEntity[]>(
    `/api/hosts/${hostId}/pet-checkins?limit=${limit}`
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const createCheckIn = async (data: {
  athleteId: string;
  hostId: string;
  locationId: string;
  activityId: string;
}): Promise<CheckInEntity> => {
  const response = await apiClient.post<CheckInEntity>('/api/checkins', data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const createPetCheckIn = async (data: {
  athleteId: string;
  petId: string;
  hostId: string;
  locationId: string;
}): Promise<PetCheckInEntity> => {
  const response = await apiClient.post<PetCheckInEntity>('/api/pet-checkins', data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const updateCheckIn = async (data: { athleteId: string; hostId: string, timestamp: number, activityId: string }): Promise<CheckInEntity> => {
  const response = await apiClient.patch<CheckInEntity>(`/api/athletes/${data.athleteId}/checkins/${data.timestamp}`, data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const deleteCheckIn = async ({ athleteId, timestamp }: { athleteId: string; timestamp: number }): Promise<void> => {
  const response = await apiClient.delete(`/api/athletes/${athleteId}/checkins/${timestamp}`);

  if (response.error) {
    throw new Error(response.error);
  }
};

const deletePetCheckIn = async ({ petId, timestamp }: { petId: string; timestamp: number }): Promise<void> => {
  const response = await apiClient.delete(`/api/pets/${petId}/checkins/${timestamp}`);

  if (response.error) {
    throw new Error(response.error);
  }
};

const getAthleteCheckInCount = async (athleteId: string, hostId?: string): Promise<number> => {
  let url = `/api/athletes/${athleteId}/checkins/count`;
  if (hostId) {
    url += `?hostId=${hostId}`;
  }

  const response = await apiClient.get<{ count: number }>(url);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!.count;
};

const getPetCheckInCount = async (petId: string, hostId?: string): Promise<number> => {
  let url = `/api/pets/${petId}/checkins/count`;
  if (hostId) {
    url += `?hostId=${hostId}`;
  }

  const response = await apiClient.get<{ count: number }>(url);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!.count;
};

const hasCheckedInAtHostWithinWeek = async ({ athleteId, hostId }: { athleteId: string; hostId: string }): Promise<boolean> => {
  const response = await apiClient.get<{ hasCheckedIn: boolean }>(
    `/api/athletes/${athleteId}/checkins/recent?hostId=${hostId}`
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!.hasCheckedIn;
};

// React Query Hooks
export const useAthleteCheckIns = (athleteId: string, limit = 50) => {
  return useQuery({
    queryKey: ['checkins', 'athlete', athleteId, { limit }],
    queryFn: () => fetchAthleteCheckIns(athleteId, limit),
    enabled: !!athleteId,
  });
};

export const usePetCheckIns = (petId: string, limit = 50) => {
  return useQuery({
    queryKey: ['checkins', 'pet', petId, { limit }],
    queryFn: () => fetchPetCheckIns(petId, limit),
    enabled: !!petId,
  });
};

export const useHostCheckIns = (hostId: string, limit = 50) => {
  return useQuery({
    queryKey: ['checkins', 'host', hostId, { limit }],
    queryFn: () => fetchHostCheckIns(hostId, limit),
    enabled: !!hostId,
  });
};

export const useHostPetCheckIns = (hostId: string, limit = 50) => {
  return useQuery({
    queryKey: ['checkins', 'host', 'pet', hostId, { limit }],
    queryFn: () => fetchHostPetCheckIns(hostId, limit),
    enabled: !!hostId,
  });
};

export const useCreateCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCheckIn,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['checkins', 'athlete', data.aid] });
      queryClient.invalidateQueries({ queryKey: ['checkins', 'host', data.hid] });
      queryClient.invalidateQueries({ queryKey: ['checkins', 'count', data.aid] });
      queryClient.invalidateQueries({ queryKey: ['rewards', 'eligibility'] });
    },
  });
};

export const useCreatePetCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPetCheckIn,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['checkins', 'pet', data.pid] });
      queryClient.invalidateQueries({ queryKey: ['checkins', 'host', 'pet', data.hid] });
      queryClient.invalidateQueries({ queryKey: ['checkins', 'count', 'pet', data.pid] });
      queryClient.invalidateQueries({ queryKey: ['rewards', 'eligibility', 'pet'] });
    },
  });
};

export const useUpdateCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCheckIn,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['checkins', 'athlete', data.aid] });
      queryClient.invalidateQueries({ queryKey: ['checkins', 'host', data.hid] });
    },
  });
};

export const useDeleteCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCheckIn,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checkins', 'athlete', variables.athleteId] });
      queryClient.invalidateQueries({ queryKey: ['checkins', 'count', variables.athleteId] });
      queryClient.invalidateQueries({ queryKey: ['rewards', 'eligibility'] });
    },
  });
};

export const useDeletePetCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePetCheckIn,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checkins', 'pet', variables.petId] });
      queryClient.invalidateQueries({ queryKey: ['checkins', 'count', 'pet', variables.petId] });
      queryClient.invalidateQueries({ queryKey: ['rewards', 'eligibility', 'pet'] });
    },
  });
};

export const useAthleteCheckInCount = (athleteId: string, hostId?: string) => {
  return useQuery({
    queryKey: ['checkins', 'count', athleteId, { hostId }],
    queryFn: () => getAthleteCheckInCount(athleteId, hostId),
    enabled: !!athleteId,
  });
};

export const usePetCheckInCount = (petId: string, hostId?: string) => {
  return useQuery({
    queryKey: ['checkins', 'count', 'pet', petId, { hostId }],
    queryFn: () => getPetCheckInCount(petId, hostId),
    enabled: !!petId,
  });
};

export const useHasCheckedInAtHostWithinWeek = (athleteId: string, hostId: string) => {
  return useQuery({
    queryKey: ['checkins', 'recent', athleteId, hostId],
    queryFn: () => hasCheckedInAtHostWithinWeek({ athleteId, hostId }),
    enabled: !!athleteId && !!hostId,
  });
};
