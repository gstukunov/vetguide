import { FC } from 'react';

import { IconProps } from './model/types';

export const SuccessIcon: FC<IconProps> = props => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 30"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_34896_1991)">
        <circle cx="15" cy="15" r="14.5" stroke="#20CC57" />
        <path
          d="M7.5 13.8623L13.385 19.5"
          stroke="#20CC57"
          strokeLinecap="round"
        />
        <path
          d="M13.3906 19.5L22.5034 10.5"
          stroke="#20CC57"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_34896_1991">
          <rect width="30" height="30" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
