import React from 'react';

import clsx from 'clsx';

import styles from './styles.module.scss';

import type { ButtonProps } from './model/types';

const Button: React.FC<ButtonProps> = ({
  colorType = 'primary',
  disabled = false,
  className,
  children,
  ...rest
}) => {
  const buttonClassName = clsx(styles.button, styles[colorType], className);

  return (
    <button className={buttonClassName} disabled={disabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;
