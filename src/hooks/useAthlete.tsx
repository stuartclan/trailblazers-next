'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AthleteEntity } from '@/lib/db/entities/types';
import { apiClient } from '@/lib/utils/api-client';

// API client functions using the new authenticated client
const fetchAthlete = async (athleteId: string): Promise<AthleteEntity> => {
  const response = await apiClient.get<AthleteEntity>(`/api/athletes/${athleteId}`);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const searchAthletes = async (searchQuery: string): Promise<AthleteEntity[]> => {
  const response = await apiClient.get<AthleteEntity[]>(`/api/athletes/search?q=${encodeURIComponent(searchQuery)}`);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const fetchAthletes = async (limit = 50, cursor?: string): Promise<{
  athletes: AthleteEntity[],
  nextCursor?: string
}> => {
  let url = `/api/athletes?limit=${limit}`;
  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }

  const response = await apiClient.get<{
    athletes: AthleteEntity[],
    nextCursor?: string
  }>(url);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
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
  const response = await apiClient.post<AthleteEntity>('/api/athletes', data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const updateAthlete = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Omit<AthleteEntity, 'pk' | 'sk' | 't' | 'id' | 'c' | 'GSI2PK' | 'GSI2SK'>>;
}): Promise<AthleteEntity> => {
  const response = await apiClient.patch<AthleteEntity>(`/api/athletes/${id}`, data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const deleteAthlete = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/api/athletes/${id}`);

  if (response.error) {
    throw new Error(response.error);
  }
};

const signDisclaimer = async ({
  athleteId,
  hostId,
}: {
  athleteId: string;
  hostId: string;
}): Promise<AthleteEntity> => {
  const response = await apiClient.post<AthleteEntity>(
    `/api/athletes/${athleteId}/disclaimer`,
    { hostId }
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const hasSignedDisclaimer = async ({
  athleteId,
  hostId,
}: {
  athleteId: string;
  hostId: string;
}): Promise<boolean> => {
  const response = await apiClient.get<{ hasSigned: boolean }>(
    `/api/athletes/${athleteId}/disclaimer/${hostId}`
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!.hasSigned;
};

// React Query Hooks (unchanged - they use the updated API functions)
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['athletes', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['athletes', 'search', data.ln] });
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
