'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getCurrentUserRequest } from '@/(shared)/api/requests/auth';
import useUserStore from '@/(stores)/user';

export const useGetCurrentUser = () => {
  const { setUser, setError } = useUserStore();

  const query = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserRequest,
    enabled: false, // Don't auto-fetch, will be triggered manually
    retry: 1, // Only retry once on failure
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Handle success and error states
  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  useEffect(() => {
    if (query.error) {
      setError(
        query.error instanceof Error
          ? query.error.message
          : 'Failed to fetch user profile'
      );
    }
  }, [query.error, setError]);

  return query;
};
