import { CreateUserDto } from '@/(shared)/api/api';
import { axiosRequest } from '@/(shared)/api/requestBase';

import { AUTH_API_ROUTES } from './model/constants';

import type {
  GetCurrentUserResponse,
  PasswordRecoveryRequest,
  PasswordResetRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SignInRequest,
  SignInResponse,
} from './model/types';

export const signInRequest = async (
  data: SignInRequest
): Promise<SignInResponse> => {
  return await axiosRequest({
    method: 'POST',
    url: AUTH_API_ROUTES.signIn,
    data,
  });
};

export const signUpRequest = async (
  data: CreateUserDto
): Promise<SignInResponse> => {
  return await axiosRequest({
    method: 'POST',
    url: AUTH_API_ROUTES.signUp,
    data,
  });
};

export const refreshTokenRequest = async (
  data: RefreshTokenRequest
): Promise<RefreshTokenResponse> => {
  return await axiosRequest({
    method: 'POST',
    url: AUTH_API_ROUTES.refreshToken,
    data,
  });
};

export const getCurrentUserRequest =
  async (): Promise<GetCurrentUserResponse> => {
    return await axiosRequest({
      method: 'GET',
      url: AUTH_API_ROUTES.getCurrentUser,
    });
  };

export const sendCodeRequest = async (data: {
  phone: string;
}): Promise<void> => {
  await axiosRequest({
    method: 'POST',
    url: AUTH_API_ROUTES.sendCode,
    data,
  });
};

export const verifyCodeRequest = async (data: {
  phone: string;
  code: string;
}): Promise<void> => {
  await axiosRequest({
    method: 'POST',
    url: AUTH_API_ROUTES.verifyCode,
    data,
  });
};

export const passwordRecoveryRequest = async (
  data: PasswordRecoveryRequest
): Promise<void> => {
  await axiosRequest({
    method: 'POST',
    url: AUTH_API_ROUTES.requestPasswordRecovery,
    data,
  });
};

export const veriyPasswordRecovery = async (data: {
  phone: string;
  code: string;
}): Promise<void> => {
  await axiosRequest({
    method: 'POST',
    url: AUTH_API_ROUTES.verifyPasswordRecovery,
    data,
  });
};

export const resetPasswordRequest = async (
  data: PasswordResetRequest
): Promise<void> => {
  await axiosRequest({
    method: 'POST',
    url: AUTH_API_ROUTES.resetPassword,
    data,
  });
};
