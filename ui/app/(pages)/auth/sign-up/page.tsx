'use client';

import { useState } from 'react';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useSignUp } from '@/(shared)/api/hooks/auth/useSignUp';
import { ChevronIcon } from '@/(shared)/icons/chevron';
import { RegistrationIcon } from '@/(shared)/icons/registration';
import Button from '@/(shared)/ui/button';
import Header from '@/(shared)/ui/header';
import { Input, PasswordInput } from '@/(shared)/ui/inputs';
import { parsePhone } from '@/(shared)/utils/phone';

import PhoneVerification from './components/verification';
import { createUserSchema } from './model/validation';
import styles from './styles.module.scss';

import type { SignUpData } from './model/types';

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignUpData>({
    resolver: zodResolver(createUserSchema),
  });

  const [isCodeSuccess, setIsCodeSuccess] = useState(false);
  const phone = watch('phone');
  const { mutate: signUp } = useSignUp();

  const onSubmit = (data: SignUpData) => {
    if (isCodeSuccess) {
      signUp({ ...data, phone: parsePhone(phone) });
    }
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
        <RegistrationIcon className={styles.registrationIcon} />
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <h1 className={styles.title}>Регистрация</h1>
          <Input
            label="Имя"
            {...register('fullName')}
            error={errors.fullName?.message}
          />
          <PhoneVerification
            phone={phone}
            setPhone={val => setValue('phone', val)}
            error={errors.phone?.message}
            onSuccess={() => setIsCodeSuccess(true)}
          />
          <PasswordInput
            label="Пароль"
            {...register('password')}
            error={errors.password?.message}
          />
          <div>
            <PasswordInput
              label="Повторите пароль"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
            <div className={styles.passwordHint}>
              Убедитесь, что ваш пароль состоит из строчных и заглавных
              латинских букв, цифр и специальных символов. Минимальная длина
              пароля — 8 символов.
            </div>
          </div>
          <Button className={styles.button} colorType="secondary" type="submit">
            Зарегистрироваться
          </Button>
          <div className={styles.privacyPolicy}>
            Регистрируясь, вы принимаете условия
            <br />
            <Link className={styles.privacyLink} href="/">
              Политики конфиденциальности
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
