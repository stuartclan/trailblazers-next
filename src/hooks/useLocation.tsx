'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { LocationEntity } from '@/lib/db/entities/types';

// API client functions
const fetchLocation = async (locationId: string): Promise<LocationEntity> => {
  const response = await fetch(`/api/locations/${locationId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch location');
  }
  return response.json();
};

const fetchLocations = async (): Promise<LocationEntity[]> => {
  const response = await fetch('/api/locations');
  if (!response.ok) {
    throw new Error('Failed to fetch locations');
  }
  return response.json();
};

const fetchLocationsByHost = async (hostId: string): Promise<LocationEntity[]> => {
  const response = await fetch(`/api/hosts/${hostId}/locations`);
  if (!response.ok) {
    throw new Error('Failed to fetch host locations');
  }
  return response.json();
};

const createLocation = async (data: {
  hostId: string;
  name: string;
  address: string;
  activityIds?: string[];
}): Promise<LocationEntity> => {
  const response = await fetch('/api/locations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create location');
  }
  
  return response.json();
};

const updateLocation = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Omit<LocationEntity, 'pk' | 'sk' | 't' | 'id' | 'c' | 'GSI1PK' | 'GSI1SK'>>;
}): Promise<LocationEntity> => {
  const response = await fetch(`/api/locations/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update location');
  }
  
  return response.json();
};

const deleteLocation = async (id: string): Promise<void> => {
  const response = await fetch(`/api/locations/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete location');
  }
};

const updateLocationActivities = async ({
  locationId,
  activityIds,
}: {
  locationId: string;
  activityIds: string[];
}): Promise<LocationEntity> => {
  const response = await fetch(`/api/locations/${locationId}/activities`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ activityIds }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update location activities');
  }
  
  return response.json();
};

// React Query Hooks
export const useLocation = (locationId: string) => {
  return useQuery({
    queryKey: ['locations', locationId],
    queryFn: () => fetchLocation(locationId),
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