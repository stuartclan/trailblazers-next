'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AthleteEntity } from '@/lib/db/entities/types';

// API client functions
const fetchAthlete = async (athleteId: string): Promise<AthleteEntity> => {
  const response = await fetch(`/api/athletes/${athleteId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch athlete');
  }
  return response.json();
};

const searchAthletes = async (searchQuery: string): Promise<AthleteEntity[]> => {
  const response = await fetch(`/api/athletes/search?q=${encodeURIComponent(searchQuery)}`);
  if (!response.ok) {
    throw new Error('Failed to search athletes');
  }
  return response.json();
};

const fetchAthletes = async (limit = 50, cursor?: string): Promise<{
  athletes: AthleteEntity[],
  nextCursor?: string
}> => {
  let url = `/api/athletes?limit=${limit}`;
  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch athletes');
  }
  return response.json();
};

const createAthlete = async (data: {
  firstName: string;
  lastName: string;
  middleInitial?: string;
  email: string;
  employer?: string;
  shirtGender?: string;
  shirtSize?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  legacyCount?: number;
}): Promise<AthleteEntity> => {
  const response = await fetch('/api/athletes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create athlete');
  }
  
  return response.json();
};

const updateAthlete = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Omit<AthleteEntity, 'pk' | 'sk' | 't' | 'id' | 'c' | 'GSI2PK' | 'GSI2SK'>>;
}): Promise<AthleteEntity> => {
  const response = await fetch(`/api/athletes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update athlete');
  }
  
  return response.json();
};

const deleteAthlete = async (id: string): Promise<void> => {
  const response = await fetch(`/api/athletes/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete athlete');
  }
};

const signDisclaimer = async ({
  athleteId,
  hostId,
}: {
  athleteId: string;
  hostId: string;
}): Promise<AthleteEntity> => {
  const response = await fetch(`/api/athletes/${athleteId}/disclaimer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hostId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sign disclaimer');
  }
  
  return response.json();
};

const hasSignedDisclaimer = async ({
  athleteId,
  hostId,
}: {
  athleteId: string;
  hostId: string;
}): Promise<boolean> => {
  const response = await fetch(`/api/athletes/${athleteId}/disclaimer/${hostId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to check disclaimer status');
  }
  
  const result = await response.json();
  return result.hasSigned;
};

// React Query Hooks
export const useAthlete = (athleteId: string) => {
  return useQuery({
    queryKey: ['athletes', athleteId],
    queryFn: () => fetchAthlete(athleteId),
    enabled: !!athleteId,
  });
};

export const useAthleteSearch = (searchQuery: string) => {
  return useQuery({
    queryKey: ['athletes', 'search', searchQuery],
    queryFn: () => searchAthletes(searchQuery),
    enabled: searchQuery.length >= 2, // Only search if at least 2 chars
  });
};

export const useAthletes = (limit = 50, cursor?: string) => {
  return useQuery({
    queryKey: ['athletes', 'list', { limit, cursor }],
    queryFn: () => fetchAthletes(limit, cursor),
  });
};

export const useCreateAthlete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAthlete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes', 'list'] });
    },
  });
};

export const useUpdateAthlete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateAthlete,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['athletes', data.id] });
      queryClient.invalidateQueries({ queryKey: ['athletes', 'list'] });
    },
  });
};

export const useDeleteAthlete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAthlete,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['athletes', variables] });
      queryClient.invalidateQueries({ queryKey: ['athletes', 'list'] });
    },
  });
};

export const useSignDisclaimer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: signDisclaimer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['athletes', data.id] });
    },
  });
};

export const useHasSignedDisclaimer = (athleteId: string, hostId: string) => {
  return useQuery({
    queryKey: ['athletes', athleteId, 'disclaimer', hostId],
    queryFn: () => hasSignedDisclaimer({ athleteId, hostId }),
    enabled: !!athleteId && !!hostId,
  });
};