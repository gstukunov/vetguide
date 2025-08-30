import { create } from 'zustand';

import type { AuthActions, AuthState } from './model/types';

const getInitialTokens = () => {
  if (typeof window !== 'undefined') {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    };
  }
  return { accessToken: null, refreshToken: null };
};

const useAuthStore = create<AuthState & AuthActions>(set => {
  const initialTokens = getInitialTokens();

  return {
    accessToken: initialTokens.accessToken,
    refreshToken: initialTokens.refreshToken,
    isAuthenticated: !!initialTokens.accessToken,
    loading: false,
    error: null,

    signIn: (accessToken, refreshToken) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    },

    signOut: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    },

    refreshTokens: (accessToken, refreshToken) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    },

    setLoading: loading => {
      set({ loading });
    },

    setError: error => {
      set({ error });
    },
  };
});

export default useAuthStore;
