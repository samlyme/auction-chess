import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createProfile, getProfile, updateProfile } from '@/services/profiles';
import type { ProfileCreate, ProfileUpdate } from 'shared';

export function useProfile(query?: { username: string } | { id: string }) {
  return useQuery({
    queryKey: ['profile', query],
    queryFn: () => getProfile(query),
  });
}

export function useProfileById(id: string) {
  return useQuery({
    queryKey: ['profile', { id }],
    queryFn: () => getProfile({ id }),
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => getProfile(),
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: ProfileCreate) => createProfile(profile),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', 'me'], data);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: ProfileUpdate) => updateProfile(profile),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', 'me'], data);
    },
  });
}
