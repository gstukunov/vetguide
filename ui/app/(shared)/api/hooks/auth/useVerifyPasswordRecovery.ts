import { useMutation } from '@tanstack/react-query';

import { veriyPasswordRecovery } from '@/(shared)/api/requests/auth';

export const useVerifyPasswordRecovery = () => {
  return useMutation({
    mutationFn: veriyPasswordRecovery,
  });
};
