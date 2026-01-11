import { axiosRequest } from '@/(shared)/api/requestBase';

import { APPOINTMENTS_API_ROUTES } from './model/constants';

import type { Appointment } from '../../api';
import type { CreateAppointmentDto } from './model/types';

export const createAppointmentRequest = async (
  dto: CreateAppointmentDto
): Promise<Appointment> => {
  return await axiosRequest<Appointment>({
    method: 'POST',
    url: APPOINTMENTS_API_ROUTES.create,
    data: dto,
  });
};

export const cancelAppointmentRequest = async (
  id: string
): Promise<Appointment> => {
  return await axiosRequest<Appointment>({
    method: 'DELETE',
    url: APPOINTMENTS_API_ROUTES.cancel(id),
  });
};
