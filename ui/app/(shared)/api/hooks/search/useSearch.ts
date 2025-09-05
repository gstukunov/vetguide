import { useQuery } from '@tanstack/react-query';

import { searchRequest } from '@/(shared)/api/requests/search';

export const useSearch = (
  query: string,
  enabled: boolean = true,
  type: 'doctors' | 'clinics' | 'all'
) => {
  return useQuery({
    queryKey: ['search', query, type || 'all'],
    queryFn: () => searchRequest(query, type),
    enabled: enabled && Boolean(query?.trim()),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
