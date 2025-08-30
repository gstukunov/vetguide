import type { SafeUserDto } from '@/(shared)/api/api';

export type UserState = {
  user: SafeUserDto | null;
  loading: boolean;
  error: string | null;
};

export type UserActions = {
  setUser: (user: SafeUserDto) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};
