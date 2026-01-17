import React from 'react';

export type StarIconProps = {
  width?: number;
  height?: number;
  className?: string;
  filled?: boolean;
  color?: string;
};

export const StarIcon: React.FC<StarIconProps> = ({
  width = 18,
  height = 17,
  className,
  filled = false,
  color = 'var(--secondary-color-bg)',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 18 17"
      fill="none"
      className={className}
    >
      <path
        d="M10.1035 6.37305L10.2158 6.71875H15.5801L11.5342 9.6582L11.2402 9.87109L11.3525 10.2168L12.8975 14.9717L8.85254 12.0332L8.55859 11.8193L8.26465 12.0332L4.21875 14.9717L5.76465 10.2168L5.87695 9.87109L5.58301 9.6582L1.53711 6.71875H6.90137L7.01367 6.37305L8.55859 1.61719L10.1035 6.37305Z"
        stroke={color}
        strokeWidth="1"
        fill={filled ? color : 'none'}
      />
    </svg>
  );
};
