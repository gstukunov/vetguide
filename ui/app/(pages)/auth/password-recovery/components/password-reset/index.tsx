import React, { useState } from 'react';

import { useResetPassword } from '@/(shared)/api/hooks/auth';
import { SuccessIcon } from '@/(shared)/icons/success';
import Button from '@/(shared)/ui/button';
import { PasswordInput } from '@/(shared)/ui/inputs';
import { parsePhone } from '@/(shared)/utils/phone';

import styles from './styles.module.scss';

import type { PasswordResetProps } from './model/types';

const PasswordReset: React.FC<PasswordResetProps> = ({ phone, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSuccess, setIsPasswordSuccess] = useState(false);

  const resetPassword = useResetPassword();

  const isPasswordValid = password.length >= 8;
  const isConfirmPasswordValid =
    confirmPassword === password && confirmPassword.length >= 8;
  const isFormValid = isPasswordValid && isConfirmPasswordValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    resetPassword.mutate(
      {
        phone: parsePhone(phone),
        password,
        passwordConfirmation: confirmPassword,
      },
      {
        onSuccess: () => {
          setIsPasswordSuccess(true);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className={styles.passwordResetForm}>
      <PasswordInput
        label="Новый пароль"
        value={password}
        onChange={e => setPassword(e.target.value)}
        error={resetPassword.error?.message ?? resetPassword.error?.message[0]}
        icon={
          isPasswordSuccess ? <SuccessIcon width={24} height={24} /> : undefined
        }
        disabled={isPasswordSuccess}
      />

      <PasswordInput
        label="Подтвердите пароль"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        error={
          confirmPassword && !isConfirmPasswordValid
            ? 'Пароли не совпадают'
            : (resetPassword.error?.message ?? resetPassword.error?.message[0])
        }
        icon={
          isPasswordSuccess ? <SuccessIcon width={24} height={24} /> : undefined
        }
        disabled={isPasswordSuccess}
      />

      <Button
        type="submit"
        colorType="primary"
        disabled={!isFormValid || resetPassword.isPending || isPasswordSuccess}
      >
        {resetPassword.isPending ? 'Сброс пароля...' : 'Сбросить пароль'}
      </Button>
    </form>
  );
};

export default PasswordReset;
