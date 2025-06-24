// src/hooks/useLocation.tsx
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { LocationEntity } from '@/lib/db/entities/types';
import { apiClient } from '@/lib/utils/api-client';

// API client functions using the new authenticated client
const fetchLocation = async (hostId: string, locationId: string): Promise<LocationEntity> => {
  const response = await apiClient.get<LocationEntity>(`/api/hosts/${hostId}/locations/${locationId}`);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const fetchLocations = async (): Promise<LocationEntity[]> => {
  const response = await apiClient.get<LocationEntity[]>('/api/locations');

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!.sort((a, b) => a.c - b.c);
};

export const fetchLocationsByHost = async (hostId: string): Promise<LocationEntity[]> => {
  const response = await apiClient.get<LocationEntity[]>(`/api/hosts/${hostId}/locations`);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!.sort((a, b) => a.c - b.c);
};

const createLocation = async (data: {
  hostId: string;
  name: string;
  address: string;
  activityIds?: string[];
}): Promise<LocationEntity> => {
  const response = await apiClient.post<LocationEntity>(`/api/hosts/${data.hostId}/locations`, data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const updateLocation = async ({
  id,
  hostId,
  data,
}: {
  id: string;
  hostId: string;
  data: Partial<Omit<LocationEntity, 'pk' | 'sk' | 't' | 'id' | 'c' | 'GSI1PK' | 'GSI1SK'>>;
}): Promise<LocationEntity> => {
  const response = await apiClient.patch<LocationEntity>(`/api/hosts/${hostId}/locations/${id}`, data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const deleteLocation = async ({
  id,
  hostId,
}: {
  id: string;
  hostId: string;
}): Promise<void> => {
  const response = await apiClient.delete(`/api/hosts/${hostId}/locations/${id}`);

  if (response.error) {
    throw new Error(response.error);
  }
};

const updateLocationActivities = async ({
  hostId,
  locationId,
  activityIds,
}: {
  hostId: string;
  locationId: string;
  activityIds: string[];
}): Promise<LocationEntity> => {
  const response = await apiClient.put<LocationEntity>(
    `/api/hosts/${hostId}/locations/${locationId}/activities`,
    { activityIds }
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

// React Query Hooks
export const useLocation = (hostId: string, locationId: string) => {
  return useQuery({
    queryKey: ['locations', locationId],
    queryFn: () => fetchLocation(hostId, locationId),
    enabled: !!locationId,
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  });
};

export const useLocationsByHost = (hostId: string) => {
  return useQuery({
    queryKey: ['locations', 'host', hostId],
    queryFn: () => fetchLocationsByHost(hostId),
    enabled: !!hostId,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLocation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'host', data.hid] });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLocation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['locations', data.id] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations', 'host', data.hid] });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLocation,
    onSuccess: (_data, variables) => {
      // We need to get the hostId from the cache to invalidate the host locations query
      const location = queryClient.getQueryData<LocationEntity>(['locations', variables]);
      if (location) {
        queryClient.invalidateQueries({ queryKey: ['locations', 'host', location.hid] });
      }

      queryClient.invalidateQueries({ queryKey: ['locations', variables] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

export const useUpdateLocationActivities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLocationActivities,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['locations', data.id] });
    },
  });
};
