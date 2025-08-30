'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AuthIcon } from '@/(shared)/icons/auth';
import { ChevronIcon } from '@/(shared)/icons/chevron';
import Button from '@/(shared)/ui/button';
import Header from '@/(shared)/ui/header';

import styles from './styles.module.scss';

export default function SignUpPage() {
  const { push } = useRouter();
  const handleSignIn = () => {
    push('/auth/sign-in');
  };
  const handleSignUp = () => {
    push('/auth/sign-up');
  };

  return (
    <div className={styles.page}>
      <Header className={styles.header} isAuthPages />
      <Link href="/" className={styles.backButton} aria-label="Назад">
        <span className={styles.chevronWrapper}>
          <ChevronIcon width={20} height={20} />
        </span>
      </Link>
      <div className={styles.container}>
        <div className={styles.authIconContainer}>
          <AuthIcon className={styles.authIcon} />
          <h1 className={styles.title}>
            Найдите своего ветеринара и помогите другим сделать правильный
            выбор.
          </h1>
        </div>
        <div className={styles.buttons}>
          <Button
            onClick={handleSignIn}
            colorType="primary"
            className={styles.button}
          >
            Войти
          </Button>
          <Button
            onClick={handleSignUp}
            colorType="secondary"
            className={styles.button}
          >
            Зарегистрироваться
          </Button>
          <Link className={styles.passwordLink} href="/auth/password-recovery">
            Забыли пароль?
          </Link>
        </div>
      </div>
    </div>
  );
}
