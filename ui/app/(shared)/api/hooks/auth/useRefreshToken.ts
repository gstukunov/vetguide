import { useMutation } from '@tanstack/react-query';

import { refreshTokenRequest } from '@/(shared)/api/requests/auth';
import type { RefreshTokenRequest } from '@/(shared)/api/requests/auth/model/types';
import useAuthStore from '@/(stores)/auth';

export const useRefreshToken = () => {
  const { refreshTokens, setError, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RefreshTokenRequest) => {
      setLoading(true);
      try {
        const response = await refreshTokenRequest(data);
        refreshTokens(response.accessToken, response.refreshToken);
        return response;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to refresh token'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
};
