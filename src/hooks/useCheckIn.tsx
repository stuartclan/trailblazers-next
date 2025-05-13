'use client';

import type { CheckInEntity, PetCheckInEntity } from '@/lib/db/entities/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// API client functions
const fetchAthleteCheckIns = async (athleteId: string, limit = 50): Promise<CheckInEntity[]> => {
  const response = await fetch(`/api/athletes/${athleteId}/checkins?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch athlete check-ins');
  }
  return response.json();
};

const fetchPetCheckIns = async (petId: string, limit = 50): Promise<PetCheckInEntity[]> => {
  const response = await fetch(`/api/pets/${petId}/checkins?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pet check-ins');
  }
  return response.json();
};

const fetchHostCheckIns = async (hostId: string, limit = 50): Promise<CheckInEntity[]> => {
  const response = await fetch(`/api/hosts/${hostId}/checkins?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch host check-ins');
  }
  return response.json();
};

const fetchHostPetCheckIns = async (hostId: string, limit = 50): Promise<PetCheckInEntity[]> => {
  const response = await fetch(`/api/hosts/${hostId}/pet-checkins?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch host pet check-ins');
  }
  return response.json();
};

const createCheckIn = async (data: {
  athleteId: string;
  hostId: string;
  locationId: string;
  activityId: string;
}): Promise<CheckInEntity> => {
  const response = await fetch('/api/checkins', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create check-in');
  }
  
  return response.json();
};

const createPetCheckIn = async (data: {
  athleteId: string;
  petId: string;
  hostId: string;
  locationId: string;
}): Promise<PetCheckInEntity> => {
  const response = await fetch('/api/pet-checkins', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create pet check-in');
  }
  
  return response.json();
};

const deleteCheckIn = async ({ athleteId, timestamp }: { athleteId: string; timestamp: number }): Promise<void> => {
  const response = await fetch(`/api/athletes/${athleteId}/checkins/${timestamp}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete check-in');
  }
};

const deletePetCheckIn = async ({ petId, timestamp }: { petId: string; timestamp: number }): Promise<void> => {
  const response = await fetch(`/api/pets/${petId}/checkins/${timestamp}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete pet check-in');
  }
};

const getAthleteCheckInCount = async (athleteId: string, hostId?: string): Promise<number> => {
  let url = `/api/athletes/${athleteId}/checkins/count`;
  if (hostId) {
    url += `?hostId=${hostId}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to get check-in count');
  }
  
  const data = await response.json();
  return data.count;
};

const getPetCheckInCount = async (petId: string, hostId?: string): Promise<number> => {
  let url = `/api/pets/${petId}/checkins/count`;
  if (hostId) {
    url += `?hostId=${hostId}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to get pet check-in count');
  }
  
  const data = await response.json();
  return data.count;
};

const hasCheckedInAtHostWithinWeek = async ({ athleteId, hostId }: { athleteId: string; hostId: string }): Promise<boolean> => {
  const response = await fetch(`/api/athletes/${athleteId}/checkins/recent?hostId=${hostId}`);
  if (!response.ok) {
    throw new Error('Failed to check recent check-ins');
  }
  
  const data = await response.json();
  return data.hasCheckedIn;
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