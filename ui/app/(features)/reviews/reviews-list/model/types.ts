import { Review } from '@/(shared)/api/api';

export type ReviewsListProps = {
  reviews?: Review[];
  onShowAll?: () => void;
  onLeaveReview?: () => void;
  showAllLink?: boolean;
  maxItems?: number;
};
