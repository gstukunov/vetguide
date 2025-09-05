import type { UnifiedSearchResultDto } from '@/(shared)/api/api';

export type SearchResultsProps = {
  data: UnifiedSearchResultDto | undefined;
  isLoading?: boolean;
  isError?: boolean;
};
