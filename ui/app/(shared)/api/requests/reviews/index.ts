import { axiosRequest } from '@/(shared)/api/requestBase';

import { REVIEWS_API_ROUTES } from './model/constants';

import type { Review } from '../../api';
import type { CreateReviewDto } from './model/types';

export const createReviewRequest = async (
  dto: CreateReviewDto
): Promise<Review> => {
  return await axiosRequest<Review>({
    method: 'POST',
    url: REVIEWS_API_ROUTES.create,
    data: dto,
  });
};

export const getReviewsByDoctorRequest = async (
  doctorId: string
): Promise<Review[]> => {
  return await axiosRequest<Review[]>({
    method: 'GET',
    url: REVIEWS_API_ROUTES.getByDoctor(doctorId),
  });
};
