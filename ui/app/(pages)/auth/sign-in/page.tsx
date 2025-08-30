'use client';

import Link from 'next/link';

import { useForm } from 'react-hook-form';

import { useSignIn } from '@/(shared)/api/hooks/auth/useSignIn';
import { ChevronIcon } from '@/(shared)/icons/chevron';
import { RegistrationIcon } from '@/(shared)/icons/registration';
import Button from '@/(shared)/ui/button';
import Header from '@/(shared)/ui/header';
import { PasswordInput, PhoneInput } from '@/(shared)/ui/inputs';
import { parsePhone } from '@/(shared)/utils/phone';

import styles from './styles.module.scss';

import type { SignInData } from './model/types';

export default function SignInPage() {
  const { register, handleSubmit } = useForm<SignInData>();
  const { mutate, isPending } = useSignIn();

  const onSubmit = (data: SignInData) => {
    mutate({ ...data, phone: parsePhone(data.phone) });
  };

  return (
    <div className={styles.page}>
      <Header className={styles.header} isAuthPages />
      <Link href="/auth" className={styles.backButton} aria-label="Назад">
        <span className={styles.chevronWrapper}>
          <ChevronIcon width={20} height={20} />
        </span>
      </Link>
      <div className={styles.container}>
        <div className={styles.registrationIcon}>
          <RegistrationIcon className={styles.registrationIcon} />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.title}>Вход</div>
          <PhoneInput
            label="Телефон"
            {...register('phone', { required: true })}
          />
          <PasswordInput
            label="Пароль"
            {...register('password', { required: true })}
          />
          <Button
            className={styles.button}
            type="submit"
            colorType="primary"
            disabled={isPending}
          >
            Войти
          </Button>
          <Link className={styles.passwordLink} href="/auth/password-recovery">
            Забыли пароль?
          </Link>
        </form>
      </div>
    </div>
  );
}
