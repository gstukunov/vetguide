import { useQuery } from '@tanstack/react-query';

import { getDoctorRequest } from '../../requests/doctors';

export const useGetDoctor = (id: string) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => getDoctorRequest(id),
    enabled: !!id,
  });
};
