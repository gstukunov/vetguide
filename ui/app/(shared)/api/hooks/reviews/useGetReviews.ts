import { useQuery } from '@tanstack/react-query';

import { getReviewsByDoctorRequest } from '../../requests/reviews';

export const useGetReviews = (doctorId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['reviews', doctorId],
    queryFn: () => getReviewsByDoctorRequest(doctorId),
    enabled: enabled && !!doctorId,
  });
};
