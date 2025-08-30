import { FC } from 'react';

import { IconProps } from './model/types';

export const ClosedEyeIcon: FC<IconProps> = props => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 28 13"
      fill="none"
      {...props}
    >
      <path
        d="M1.44922 1C1.44922 1 6.27101 6.85568 14.5369 6.68421C22.8029 6.51274 26.9358 1 26.9358 1"
        stroke="var(--primary-color-icon)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.866514 8.87587L4.31065 3.82324L5.4789 4.49271L2.03476 9.54535C1.83314 9.84114 1.40816 9.93106 1.08556 9.74619C0.762958 9.56132 0.664887 9.17167 0.866514 8.87587Z"
        fill="var(--primary-color-icon)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.5214 8.87587L24.0772 3.82324L22.909 4.49271L26.3531 9.54535C26.5548 9.84114 26.9797 9.93106 27.3023 9.74619C27.6249 9.56132 27.723 9.17167 27.5214 8.87587Z"
        fill="var(--primary-color-icon)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.04415 12.2315L10.4218 6.54729L11.7667 6.8213L10.389 12.5055C10.3065 12.846 9.93851 13.0607 9.56714 12.985C9.19577 12.9094 8.96162 12.572 9.04415 12.2315Z"
        fill="var(--primary-color-icon)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.0326 12.2315L18.6549 6.54729L17.3101 6.8213L18.6877 12.5055C18.7703 12.846 19.1382 13.0607 19.5096 12.985C19.881 12.9094 20.1151 12.572 20.0326 12.2315Z"
        fill="var(--primary-color-icon)"
      />
    </svg>
  );
};
