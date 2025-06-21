// src/hooks/useHost.tsx
'use client';

import type { ErrorCognito, HostEntity } from '@/lib/db/entities/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/utils/api-client';

// API client functions using the new authenticated client
const fetchHost = async (hostId: string): Promise<HostEntity> => {
  const response = await apiClient.get<HostEntity>(`/api/hosts/${hostId}`);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const fetchHosts = async (): Promise<HostEntity[]> => {
  const response = await apiClient.get<HostEntity[]>('/api/hosts');

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const createHost = async (data: {
  name: string;
  email: string;
  password: string;
  adminPassword: string;
  disclaimer?: string;
}): Promise<HostEntity> => {
  const response = await apiClient.post<HostEntity>('/api/hosts', data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const updateHost = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Omit<HostEntity, 'pk' | 'sk' | 't' | 'id' | 'c'>>;
}): Promise<HostEntity> => {
  const response = await apiClient.patch<HostEntity>(`/api/hosts/${id}`, data);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const deleteHost = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/api/hosts/${id}`);

  if (response.error) {
    throw new Error(response.error);
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
  const response = await apiClient.post<HostEntity>(
    `/api/hosts/${hostId}/rewards`,
    rewardData
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
};

const removeCustomReward = async ({
  hostId,
  rewardId,
}: {
  hostId: string;
  rewardId: string;
}): Promise<HostEntity> => {
  const response = await apiClient.delete<HostEntity>(`/api/hosts/${hostId}/rewards/${rewardId}`);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data!;
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
