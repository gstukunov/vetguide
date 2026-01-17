import React, { useState } from 'react';

import clsx from 'clsx';

import { StarIcon } from '@/(shared)/icons/star';

import { StarRatingProps } from './model/types';
import styles from './styles.module.scss';

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'medium',
  color,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoveredRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className={clsx(styles.starRating, styles[size])}>
      {[1, 2, 3, 4, 5].map(value => {
        const isFilled = value <= displayRating;

        return (
          <button
            key={value}
            type="button"
            className={clsx(styles.star, {
              [styles.readonly]: readonly,
            })}
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            aria-label={`Оценить ${value} из 5`}
          >
            <StarIcon
              className={styles.starIcon}
              filled={isFilled}
              color={color}
            />
          </button>
        );
      })}
    </div>
  );
};
