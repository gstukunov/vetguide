import React from 'react';

import clsx from 'clsx';

import { StarIcon } from '@/(shared)/icons/star';

import { StarRatingProps } from './model/types';
import styles from './styles.module.scss';

export const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  return (
    <div className={clsx(styles.starRating)}>
      {[1, 2, 3, 4, 5].map(value => {
        const isFilled = value <= rating;

        return (
          <div
            key={value}
            className={styles.star}
            aria-label={`Оценить ${value} из 5`}
          >
            <StarIcon className={styles.starIcon} filled={isFilled} />
          </div>
        );
      })}
    </div>
  );
};
