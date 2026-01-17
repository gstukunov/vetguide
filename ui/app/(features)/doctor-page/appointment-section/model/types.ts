import type { WeekSchedule } from '@/(shared)/ui/schedule-selector/model/types';

export type AppointmentSectionProps = {
  weeks: WeekSchedule[];
  currentWeekIndex: number;
  selectedDate?: Date;
  selectedTimeSlot?: string;
  onDateSelect: (date: Date) => void;
  onTimeSlotSelect: (timeSlot: string) => void;
  onWeekChange: (direction: 'prev' | 'next') => void;
  onMobileBooking: () => void;
};
