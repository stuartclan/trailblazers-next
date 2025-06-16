// src/hooks/usePet.tsx
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { PetEntity } from '@/lib/db/entities/types';
import { apiClient } from '@/lib/utils/api-client';

// API client functions using the new authenticated client
const fetchPet = async (petId: string): Promise<PetEntity> => {
  const response = await apiClient.get<PetEntity>(`/api/pets/${petId}`);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.data!;
};

const fetchAthletesPets = async (athleteId: string): Promise<PetEntity[]> => {
  const response = await apiClient.get<PetEntity[]>(`/api/athletes/${athleteId}/pets`);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.data!;
};

const fetchPets = async (limit = 50, cursor?: string): Promise<{
  pets: PetEntity[],
  nextCursor?: string
}> => {
  let url = `/api/pets?limit=${limit}`;
  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }
  
  const response = await apiClient.get<{
    pets: PetEntity[],
    nextCursor?: string
  }>(url);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.data!;
};

const createPet = async (data: {
  athleteId: string;
  name: string;
}): Promise<PetEntity> => {
  const response = await apiClient.post<PetEntity>('/api/pets', data);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.data!;
};

const updatePet = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Omit<PetEntity, 'pk' | 'sk' | 't' | 'id' | 'c' | 'GSI1PK' | 'GSI1SK'>>;
}): Promise<PetEntity> => {
  const response = await apiClient.patch<PetEntity>(`/api/pets/${id}`, data);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.data!;
};

const deletePet = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/api/pets/${id}`);
  
  if (response.error) {
    throw new Error(response.error);
  }
};

const checkPetExists = async ({ athleteId, name }: { athleteId: string; name: string }): Promise<boolean> => {
  const response = await apiClient.get<{ exists: boolean }>(
    `/api/athletes/${athleteId}/pets/exists?name=${encodeURIComponent(name)}`
  );
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.data!.exists;
};

// React Query Hooks
export const usePet = (petId: string) => {
  return useQuery({
    queryKey: ['pets', petId],
    queryFn: () => fetchPet(petId),
    enabled: !!petId,
  });
};

export const useAthletesPets = (athleteId: string) => {
  return useQuery({
    queryKey: ['pets', 'athlete', athleteId],
    queryFn: () => fetchAthletesPets(athleteId),
    enabled: !!athleteId,
  });
};

export const usePets = (limit = 50, cursor?: string) => {
  return useQuery({
    queryKey: ['pets', 'list', { limit, cursor }],
    queryFn: () => fetchPets(limit, cursor),
  });
};

export const useCreatePet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPet,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pets', 'athlete', data.aid] });
      queryClient.invalidateQueries({ queryKey: ['pets', 'list'] });
    },
  });
};

export const useUpdatePet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePet,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pets', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pets', 'athlete', data.aid] });
      queryClient.invalidateQueries({ queryKey: ['pets', 'list'] });
    },
  });
};

export const useDeletePet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePet,
    onSuccess: (_data, variables) => {
      // We need the pet data to know which athlete's pets to invalidate
      // Fortunately, it should be in the cache
      const pet = queryClient.getQueryData<PetEntity>(['pets', variables]);
      
      if (pet) {
        queryClient.invalidateQueries({ queryKey: ['pets', 'athlete', pet.aid] });
      }
      
      queryClient.invalidateQueries({ queryKey: ['pets', variables] });
      queryClient.invalidateQueries({ queryKey: ['pets', 'list'] });
    },
  });
};

export const usePetExists = (athleteId: string, name: string) => {
  return useQuery({
    queryKey: ['pets', 'exists', athleteId, name],
    queryFn: () => checkPetExists({ athleteId, name }),
    enabled: !!athleteId && !!name,
  });
};