import React from 'react';

import Button from '@/(shared)/ui/button';

import { ReviewsListProps } from './model/types';
import { StarRating } from './rating';
import styles from './styles.module.scss';

export const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews = [],
  onShowAll,
  onLeaveReview,
  showAllLink = true,
  maxItems,
}) => {
  // Filter only verified reviews
  const verifiedReviews = reviews.filter(
    review => review.status === 'VERIFIED'
  );
  const displayReviews = maxItems
    ? verifiedReviews.slice(0, maxItems)
    : verifiedReviews;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.reviewsList}>
      <div className={styles.header}>
        <h2 className={styles.title}>Отзывы</h2>
        {showAllLink && onShowAll && reviews.length > 0 && (
          <button
            type="button"
            className={styles.showAllLink}
            onClick={onShowAll}
          >
            Все отзывы
          </button>
        )}
      </div>

      {displayReviews.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Пока нет отзывов</p>
          {onLeaveReview && (
            <Button
              colorType="primary"
              className={styles.leaveReviewButton}
              onClick={onLeaveReview}
            >
              Оставить отзыв
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.reviews}>
            {displayReviews.map(review => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {getInitials(review.user.fullName)}
                    </div>
                    <div className={styles.userDetails}>
                      <div className={styles.userName}>
                        {review.user.fullName}
                      </div>
                      <div className={styles.reviewDate}>
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <StarRating rating={review.rating} />
                  </div>
                </div>
                <div className={styles.reviewText}>{review.description}</div>
              </div>
            ))}
          </div>

          {onLeaveReview && (
            <div className={styles.actionSection}>
              <Button
                colorType="secondary"
                className={styles.leaveReviewButton}
                onClick={onLeaveReview}
              >
                Оставить отзыв
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
