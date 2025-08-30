'use client';
import React, { useState, useCallback } from 'react';

import Input from '../input';

import { formatPhoneNumber } from './model/utils';

import type { PhoneInputProps } from './model/types';

const PhoneInput: React.FC<PhoneInputProps> = ({
  onChange,
  value,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState<string>(
    typeof value === 'string' ? value : ''
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      const formatted = formatPhoneNumber(raw);
      setInternalValue(formatted);
      if (onChange) {
        // Create a synthetic event with the formatted value
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: formatted },
        };
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
    },
    [onChange]
  );

  return (
    <Input
      {...rest}
      type="tel"
      value={internalValue}
      onChange={handleChange}
      maxLength={16}
      placeholder="+7(000)111-22-33"
    />
  );
};

export default PhoneInput;
