'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { HostEntity } from '@/lib/db/entities/types';

// API client functions
const fetchHost = async (hostId: string): Promise<HostEntity> => {
  const response = await fetch(`/api/hosts/${hostId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch host');
  }
  return response.json();
};

const fetchHosts = async (): Promise<HostEntity[]> => {
  const response = await fetch('/api/hosts');
  if (response.status === 401) {
    // Need to log-in
    throw new Error('Login required');
  }
  if (!response.ok) {
    throw new Error('Failed to fetch hosts');
  }
  return response.json();
};

const createHost = async (data: {
  name: string;
  email: string;
  password: string;
  disclaimer?: string;
}): Promise<HostEntity> => {
  const response = await fetch('/api/hosts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create host');
  }
  
  return response.json();
};

const updateHost = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Omit<HostEntity, 'pk' | 'sk' | 't' | 'id' | 'c'>>;
}): Promise<HostEntity> => {
  const response = await fetch(`/api/hosts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update host');
  }
  
  return response.json();
};

const deleteHost = async (id: string): Promise<void> => {
  const response = await fetch(`/api/hosts/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete host');
  }
};

const addCustomReward = async ({
  hostId,
  rewardData,
}: {
  hostId: string;
  rewardData: {
    count: number;
    name: string;
    icon: string;
  };
}): Promise<HostEntity> => {
  const response = await fetch(`/api/hosts/${hostId}/rewards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rewardData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add custom reward');
  }
  
  return response.json();
};

const removeCustomReward = async ({
  hostId,
  rewardId,
}: {
  hostId: string;
  rewardId: string;
}): Promise<HostEntity> => {
  const response = await fetch(`/api/hosts/${hostId}/rewards/${rewardId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove custom reward');
  }
  
  return response.json();
};

// React Query Hooks
export const useHost = (hostId: string) => {
  return useQuery({
    queryKey: ['hosts', hostId],
    queryFn: () => fetchHost(hostId),
    enabled: !!hostId,
  });
};

export const useHosts = () => {
  return useQuery({
    queryKey: ['hosts'],
    queryFn: fetchHosts,
  });
};

export const useCreateHost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createHost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
    },
  });
};

export const useUpdateHost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateHost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hosts', data.id] });
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
    },
  });
};

export const useDeleteHost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteHost,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hosts', variables] });
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
    },
  });
};

export const useAddCustomReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addCustomReward,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hosts', data.id] });
    },
  });
};

export const useRemoveCustomReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeCustomReward,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hosts', data.id] });
    },
  });
};