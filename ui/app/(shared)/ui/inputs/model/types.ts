import React from 'react';

export type InputProps<T = HTMLInputElement> = React.InputHTMLAttributes<T> & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
};
