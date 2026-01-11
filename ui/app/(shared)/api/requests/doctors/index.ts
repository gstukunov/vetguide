import { axiosRequest } from '@/(shared)/api/requestBase';

import { Doctor } from '../../api';

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

export const getDoctorRequest = async (id: string) => {
  return await axiosRequest<Doctor>({
    method: 'GET',
    url: DOCTORS_API_ROUTES.getDoctor(id),
  });
};

// Removed getDoctorScheduleRequest - schedule is now generated client-side from doctor appointments
