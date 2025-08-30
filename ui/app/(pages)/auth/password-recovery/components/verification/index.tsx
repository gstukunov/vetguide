import React, { useEffect, useRef, useState } from 'react';

import {
  usePasswordRecovery,
  useVerifyPasswordRecovery,
} from '@/(shared)/api/hooks/auth';
import { SuccessIcon } from '@/(shared)/icons/success';
import Button from '@/(shared)/ui/button';
import { Input, PhoneInput } from '@/(shared)/ui/inputs';
import { parsePhone } from '@/(shared)/utils/phone';

import styles from './styles.module.scss';

import type { PhoneVerificationProps } from './model/types';

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  phone,
  setPhone,
  setCode: setCodeProp,
  disabled,
  onSuccess,
}) => {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [isCodeSuccess, setIsCodeSuccess] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const passwordRecovery = usePasswordRecovery();
  const verifyCode = useVerifyPasswordRecovery();

  const isPhoneValid = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(phone);

  const startTimer = () => {
    setTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSendCode = () => {
    passwordRecovery.mutate(
      { phone: parsePhone(phone) },
      {
        onSuccess: () => {
          setIsCodeSent(true);
          startTimer();
        },
      }
    );
  };

  const handleResendCode = () => {
    handleSendCode();
  };

  const handleCodeChange = (val: string) => {
    setCode(val);
    if (val.length === 6) {
      setCodeProp(val); // Pass code to parent component
      verifyCode.mutate(
        { phone: parsePhone(phone), code: val },
        {
          onSuccess: () => {
            setIsCodeSuccess(true);
            onSuccess?.();
          },
        }
      );
    }
  };

  return (
    <>
      <PhoneInput
        label="Телефон"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        error={
          passwordRecovery.error?.message ?? passwordRecovery.error?.message[0]
        }
        icon={
          isCodeSuccess ? <SuccessIcon width={24} height={24} /> : undefined
        }
        disabled={isCodeSuccess || isCodeSent || disabled}
      />
      {!isCodeSent && (
        <Button
          type="button"
          colorType="secondary"
          disabled={!isPhoneValid || passwordRecovery.isPending || disabled}
          onClick={handleSendCode}
        >
          Отправить код
        </Button>
      )}
      {isCodeSent && !isCodeSuccess && (
        <>
          <Input
            label="Код из SMS"
            value={code}
            onChange={e =>
              handleCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="000000"
            maxLength={6}
            error={verifyCode.error?.message ?? verifyCode.error?.message[0]}
          />
          <div className={styles.timerOrResend}>
            {timer !== 0 ? (
              <span className={styles.timer}>
                Отправить код повторно через {timer} сек.
              </span>
            ) : (
              <Button
                type="button"
                colorType="secondary"
                onClick={handleResendCode}
                disabled={passwordRecovery.isPending}
              >
                Отправить код повторно
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default PhoneVerification;
