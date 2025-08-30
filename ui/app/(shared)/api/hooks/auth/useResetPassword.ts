import { useMutation } from '@tanstack/react-query';

import { resetPasswordRequest } from '@/(shared)/api/requests/auth';

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPasswordRequest,
  });
};
