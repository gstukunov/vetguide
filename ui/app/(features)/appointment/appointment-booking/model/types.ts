import { Doctor, VetClinic } from '@/(shared)/api/api';
import type { WeekSchedule } from '@/(shared)/ui/schedule-selector/model/types';

export type AppointmentBookingProps = {
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
