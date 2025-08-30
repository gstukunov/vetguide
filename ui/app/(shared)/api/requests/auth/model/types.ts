import {
  AccessDto,
  LoginDto,
  PasswordRecoveryRequestDto,
  PasswordResetDto,
  RefreshDto,
  SafeUserDto,
} from '@/(shared)/api/api';

export type SignInRequest = LoginDto;

export type SignInResponse = AccessDto;

export type RefreshTokenRequest = RefreshDto;

export type RefreshTokenResponse = AccessDto;

export type GetCurrentUserResponse = SafeUserDto;

export type PasswordRecoveryRequest = PasswordRecoveryRequestDto;

export type PasswordResetRequest = PasswordResetDto;
