import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createReviewRequest } from '../../requests/reviews';

import type { CreateReviewDto } from '../../requests/reviews/model/types';

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateReviewDto) => createReviewRequest(dto),
    onSuccess: (_, variables) => {
      // Invalidate doctor queries to refresh reviews
      queryClient.invalidateQueries({
        queryKey: ['doctor', variables.doctorId],
      });
      queryClient.invalidateQueries({
        queryKey: ['reviews', variables.doctorId],
      });
    },
  });
};
