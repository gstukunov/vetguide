'use client';

import { FC, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ChevronIcon } from '@/(shared)/icons/chevron';
import { CodeRequestIcon } from '@/(shared)/icons/code-request';
import { PasswordChangeIcon } from '@/(shared)/icons/password-change';
import Header from '@/(shared)/ui/header';

import PasswordReset from './components/password-reset';
import PhoneVerification from './components/verification';
import styles from './styles.module.scss';

const PasswordRecoveryPage: FC = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const { push } = useRouter();

  const handleVerificationSuccess = () => {
    setStep(2);
  };

  const handlePasswordResetSuccess = () => {
    push('/auth/sign-in');
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
          {step === 1 ? (
            <CodeRequestIcon className={styles.registrationIcon} />
          ) : (
            <PasswordChangeIcon className={styles.registrationIcon} />
          )}
        </div>
        <div className={styles.form}>
          <div>
            <div className={styles.title}>Восстановление пароля</div>
            {step === 1 && (
              <div className={styles.subtitle}>
                Введите номер телефона, указанный при регистрации. Мы отправим
                вам код для восстановления пароля
              </div>
            )}
          </div>
          {step === 1 ? (
            <PhoneVerification
              phone={phone}
              setPhone={setPhone}
              setCode={() => {}}
              onSuccess={handleVerificationSuccess}
            />
          ) : (
            <PasswordReset
              phone={phone}
              onSuccess={handlePasswordResetSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryPage;
