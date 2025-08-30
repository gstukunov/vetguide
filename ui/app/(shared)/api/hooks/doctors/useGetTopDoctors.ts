import { useQuery } from '@tanstack/react-query';

import { getTopDoctorsRequest } from '@/(shared)/api/requests/doctors';

export const useGetTopDoctors = () => {
  return useQuery({
    queryKey: ['topDoctors'],
    queryFn: getTopDoctorsRequest,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
