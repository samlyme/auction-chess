import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProfileCreate, ProfileUpdate } from 'shared';
import { parseResponse } from 'hono/client';
import { api } from './api';

export function useProfile(query?: { username: string } | { id: string }) {
  return useQuery({
    queryKey: ['profile', query],
    queryFn: () => {
      if (query) {
        return parseResponse(api.profiles.$get({ query }));
      } else {
        return parseResponse(api.profiles.me.$get());
      }
    },
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => parseResponse(api.profiles.me.$get()),
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: ProfileCreate) => parseResponse(api.profiles.$post({ json: profile })),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', 'me'], data);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: ProfileUpdate) => parseResponse(api.profiles.$put({ json: profile })),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', 'me'], data);
    },
  });
}
