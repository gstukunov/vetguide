import { useRouter } from 'next/navigation';

import { Doctor } from '@/(shared)/api/api';
import { isAuthenticated } from '@/(shared)/api/requestBase';

import { useCreateAppointment } from './useCreateAppointment';

export type UseConfirmBookingParams = {
  doctor: Doctor | undefined;
  selectedDate: Date | undefined;
  selectedTimeSlot: string | undefined;
  canBookAppointment: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export const useConfirmBooking = ({
  doctor,
  selectedDate,
  selectedTimeSlot,
  canBookAppointment,
  onSuccess,
  onError,
}: UseConfirmBookingParams) => {
  const router = useRouter();
  const { mutate: createAppointment } = useCreateAppointment();

  const confirmBooking = () => {
    // Проверяем авторизацию
    if (!isAuthenticated()) {
      router.push('/auth/sign-in');
      return;
    }

    if (!selectedDate || !selectedTimeSlot || !doctor || !canBookAppointment) {
      console.error(
        'Cannot book appointment: missing data or slot not available'
      );
      return;
    }

    // Форматируем дату в формат YYYY-MM-DD используя локальное время (не UTC)
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Проверяем формат timeSlot (должен быть HH:mm)
    // selectedTimeSlot уже в формате HH:mm из generateTimeSlots

    createAppointment(
      {
        doctorId: doctor.id,
        date: dateStr, // YYYY-MM-DD format
        timeSlot: selectedTimeSlot, // HH:mm format
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: (error: unknown) => {
          console.error('Failed to create appointment:', error);
          onError?.(error);
        },
      }
    );
  };

  return { confirmBooking };
};
