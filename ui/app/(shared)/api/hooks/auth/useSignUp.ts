import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { signUpRequest } from '@/(shared)/api/requests/auth';
import useAuthStore from '@/(stores)/auth';
import useUserStore from '@/(stores)/user';

export const useSignUp = () => {
  const signIn = useAuthStore(state => state.signIn);
  const clearUser = useUserStore(state => state.clearUser);
  const { push } = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUpRequest,
    onSuccess: data => {
      // Clear any existing user data
      clearUser();

      // Sign in with tokens
      signIn(data.accessToken, data.refreshToken);

      // Trigger user profile fetch
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      push('/');
    },
  });
};
