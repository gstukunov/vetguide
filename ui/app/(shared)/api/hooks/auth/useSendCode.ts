import { useMutation } from '@tanstack/react-query';

import { sendCodeRequest } from '@/(shared)/api/requests/auth';

export const useSendCode = () => {
  return useMutation({
    mutationFn: sendCodeRequest,
  });
};
