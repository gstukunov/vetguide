import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cancelAppointmentRequest } from '../../requests/appointments';

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelAppointmentRequest(id),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
    },
  });
};
