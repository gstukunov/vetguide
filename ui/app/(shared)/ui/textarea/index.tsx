import React, { forwardRef } from 'react';

import clsx from 'clsx';

import styles from './styles.module.scss';

export type TextareaProps = {
  label?: string;
  error?: string;
  className?: string;
  rows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, rows = 4, ...rest }, ref) => {
    const textareaClassName = clsx(
      styles.textarea,
      { [styles.error]: error },
      className
    );

    return (
      <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <textarea
          ref={ref}
          className={textareaClassName}
          rows={rows}
          {...rest}
        />
        {error && <div className={styles.errorText}>{error}</div>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
