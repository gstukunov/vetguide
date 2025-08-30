'use client';
import React, { useState, useCallback } from 'react';

import { ClosedEyeIcon } from '@/(shared)/icons/closed-eye';
import { OpenedEyeIcon } from '@/(shared)/icons/opened-eye';

import Input from '../input';

import type { PasswordInputProps } from './model/types';

const PasswordInput: React.FC<PasswordInputProps> = ({ label, ...rest }) => {
  const [visible, setVisible] = useState(false);
  const toggleVisibility = useCallback(() => setVisible(v => !v), []);

  const icon = (
    <span onClick={toggleVisibility} style={{ cursor: 'pointer' }} tabIndex={0}>
      {visible ? (
        <OpenedEyeIcon width={24} height={13} />
      ) : (
        <ClosedEyeIcon width={24} height={13} />
      )}
    </span>
  );

  return (
    <Input
      {...rest}
      label={label}
      type={visible ? 'text' : 'password'}
      icon={icon}
    />
  );
};

export default PasswordInput;
