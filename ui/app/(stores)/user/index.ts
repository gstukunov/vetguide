import { create } from 'zustand';

import type { UserActions, UserState } from './model/types';

const useUserStore = create<UserState & UserActions>(set => ({
  user: null,
  loading: false,
  error: null,

  setUser: user => {
    set({ user, error: null });
  },

  clearUser: () => {
    set({ user: null, error: null });
  },

  setLoading: loading => {
    set({ loading });
  },

  setError: error => {
    set({ error });
  },
}));

export default useUserStore;
