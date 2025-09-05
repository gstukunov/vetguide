import { axiosRequest } from '@/(shared)/api/requestBase';

import { UnifiedSearchResultDto } from '../../api';

import { SEARCH_API_ROUTES } from './model/constants';

export const searchRequest = async (
  query: string,
  type?: 'doctors' | 'clinics' | 'all'
): Promise<UnifiedSearchResultDto> => {
  return await axiosRequest({
    method: 'GET',
    url: SEARCH_API_ROUTES.search,
    params: { query, type },
  });
};
