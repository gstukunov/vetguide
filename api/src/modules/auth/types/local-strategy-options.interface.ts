import { IStrategyOptions } from 'passport-local';

export interface PhoneStrategyOptions extends IStrategyOptions {
  usernameField: 'phone';
  passwordField: 'password';
}
