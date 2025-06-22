// src/hooks/useActivity.tsx
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ActivityEntity } from '@/lib/db/entities/types';
import { apiClient } from '@/lib/utils/api-client';

// API client functions using the new authenticated client
const fetchActivity = async (activityId: string): Promise<ActivityEntity> => {
  const response = await apiClient.get<ActivityEntity>(`/api/activities/${activityId}`);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const fetchActivities = async (includeDisabled = false): Promise<ActivityEntity[]> => {
  const response = await apiClient.get<ActivityEntity[]>(
    `/api/activities?includeDisabled=${includeDisabled}`
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const fetchLocationActivities = async (hostId: string, locationId: string): Promise<ActivityEntity[]> => {
  const response = await apiClient.get<ActivityEntity[]>(`/api/hosts/${hostId}/locations/${locationId}/activities`);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const createActivity = async (data: {
  name: string;
  icon: string;
  enabled?: boolean;
}): Promise<ActivityEntity> => {
  const response = await apiClient.post<ActivityEntity>('/api/activities', data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const updateActivity = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Omit<ActivityEntity, 'pk' | 'sk' | 't' | 'id' | 'c'>>;
}): Promise<ActivityEntity> => {
  const response = await apiClient.patch<ActivityEntity>(`/api/activities/${id}`, data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const deleteActivity = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/api/activities/${id}`);

  if (response.error) {
    throw new Error(response.error);
  }
};

const createDefaultActivities = async (): Promise<ActivityEntity[]> => {
  const response = await apiClient.post<ActivityEntity[]>('/api/activities/create-defaults');

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

// React Query Hooks
export const useActivity = (activityId: string) => {
  return useQuery({
    queryKey: ['activities', activityId],
    queryFn: () => fetchActivity(activityId),
    enabled: !!activityId,
  });
};

export const useActivities = (includeDisabled = false) => {
  return useQuery({
    queryKey: ['activities', { includeDisabled }],
    queryFn: () => fetchActivities(includeDisabled),
  });
};

export const useLocationActivities = (hostId: string, locationId: string) => {
  return useQuery({
    queryKey: ['activities', 'location', locationId],
    queryFn: () => fetchLocationActivities(hostId, locationId),
    enabled: !!locationId,
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateActivity,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities', data.id] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities', variables] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useCreateDefaultActivities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDefaultActivities,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};
