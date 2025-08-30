import { axiosRequest } from '@/(shared)/api/requestBase';

import { DOCTORS_API_ROUTES } from './model/constants';

import type { GetTopDoctorsResponse } from './model/types';

export const getTopDoctorsRequest =
  async (): Promise<GetTopDoctorsResponse> => {
    return await axiosRequest({
      method: 'GET',
      url: DOCTORS_API_ROUTES.getTopDoctors,
      params: {
        limit: 6,
      },
    });
  };
