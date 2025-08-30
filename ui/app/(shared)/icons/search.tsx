import { FC } from 'react';

import { IconProps } from './model/types';

export const SearchIcon: FC<IconProps> = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="42"
    height="41"
    viewBox="0 0 42 41"
    fill="none"
    {...props}
  >
    <path
      d="M19.3398 36.001C28.7288 36.001 36.3398 28.39 36.3398 19.001C36.3398 9.61198 28.7288 2.00098 19.3398 2.00098C9.95084 2.00098 2.33984 9.61198 2.33984 19.001C2.33984 28.39 9.95084 36.001 19.3398 36.001Z"
      stroke="black"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M24.9959 12.343C24.2536 11.5993 23.3718 11.0094 22.401 10.6073C21.4303 10.2053 20.3896 9.99888 19.3389 10C18.2881 9.99888 17.2475 10.2053 16.2767 10.6073C15.3059 11.0094 14.4241 11.5993 13.6819 12.343M31.5609 31.222L40.0459 39.707"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
