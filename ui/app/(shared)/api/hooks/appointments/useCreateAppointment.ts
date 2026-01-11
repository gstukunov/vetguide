import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createAppointmentRequest } from '../../requests/appointments';

import type { CreateAppointmentDto } from '../../requests/appointments/model/types';

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateAppointmentDto) => createAppointmentRequest(dto),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
      // Removed doctor-schedule invalidation - schedule is now generated client-side
    },
  });
};
