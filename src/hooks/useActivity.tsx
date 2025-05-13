'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ActivityEntity } from '@/lib/db/entities/types';

// API client functions
const fetchActivity = async (activityId: string): Promise<ActivityEntity> => {
  const response = await fetch(`/api/activities/${activityId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch activity');
  }
  return response.json();
};

const fetchActivities = async (includeDisabled = false): Promise<ActivityEntity[]> => {
  const response = await fetch(`/api/activities?includeDisabled=${includeDisabled}`);
  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }
  return response.json();
};

const fetchLocationActivities = async (locationId: string): Promise<ActivityEntity[]> => {
  const response = await fetch(`/api/locations/${locationId}/activities`);
  if (!response.ok) {
    throw new Error('Failed to fetch location activities');
  }
  return response.json();
};

const createActivity = async (data: {
  name: string;
  icon: string;
  enabled?: boolean;
}): Promise<ActivityEntity> => {
  const response = await fetch('/api/activities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create activity');
  }
  
  return response.json();
};

const updateActivity = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Omit<ActivityEntity, 'pk' | 'sk' | 't' | 'id' | 'c'>>;
}): Promise<ActivityEntity> => {
  const response = await fetch(`/api/activities/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update activity');
  }
  
  return response.json();
};

const deleteActivity = async (id: string): Promise<void> => {
  const response = await fetch(`/api/activities/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete activity');
  }
};

const createDefaultActivities = async (): Promise<ActivityEntity[]> => {
  const response = await fetch('/api/activities/create-defaults', {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create default activities');
  }
  
  return response.json();
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

export const useLocationActivities = (locationId: string) => {
  return useQuery({
    queryKey: ['activities', 'location', locationId],
    queryFn: () => fetchLocationActivities(locationId),
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