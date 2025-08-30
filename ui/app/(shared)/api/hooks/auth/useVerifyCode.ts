import { useMutation } from '@tanstack/react-query';

import { verifyCodeRequest } from '@/(shared)/api/requests/auth';

export const useVerifyCode = () => {
  return useMutation({
    mutationFn: verifyCodeRequest,
  });
};
