import type { WeekSchedule } from '@/(shared)/ui/schedule-selector/model/types';

import { Doctor, VetClinic } from '../../../api/api';

export type AppointmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  clinic: VetClinic;
  selectedDate?: Date;
  selectedTimeSlot?: string;
  onConfirmBooking: () => void;
  // Schedule selector props
  weeks: WeekSchedule[];
  currentWeekIndex: number;
  onDateSelect: (date: Date) => void;
  onTimeSlotSelect: (timeSlot: string) => void;
  onWeekChange: (direction: 'prev' | 'next') => void;
};
