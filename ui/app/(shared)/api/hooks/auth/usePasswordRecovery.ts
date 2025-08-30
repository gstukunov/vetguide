import { useMutation } from '@tanstack/react-query';

import { passwordRecoveryRequest } from '@/(shared)/api/requests/auth';

export const usePasswordRecovery = () => {
  return useMutation({
    mutationFn: passwordRecoveryRequest,
  });
};
