import React, { forwardRef } from 'react';

import clsx from 'clsx';

import styles from './styles.module.scss';

import type { InputProps } from '../model/types';

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...rest }, ref) => {
    const inputClassName = clsx(
      styles.input,
      { [styles.error]: error },
      icon && styles.withIcon,
      className
    );

    return (
      <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputContainer}>
          <input ref={ref} className={inputClassName} {...rest} />
          {icon && <div className={styles.icon}>{icon}</div>}
        </div>
        {error && <div className={styles.errorText}>{error}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
