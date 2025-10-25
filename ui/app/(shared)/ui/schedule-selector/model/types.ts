export type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
};

export type DaySchedule = {
  date: Date;
  dayOfWeek: string;
  dayOfWeekShort: string;
  dayNumber: number;
  isToday: boolean;
  timeSlots: TimeSlot[];
};

export type WeekSchedule = {
  weekNumber: number;
  days: DaySchedule[];
};

export type ScheduleSelectorProps = {
  weeks: WeekSchedule[];
  selectedDate?: Date;
  selectedTimeSlot?: string;
  onDateSelect: (date: Date) => void;
  onTimeSlotSelect: (timeSlot: string) => void;
  onWeekChange: (direction: 'prev' | 'next') => void;
  currentWeekIndex: number;
  title?: string;
  monthName?: string;
};

export type ScheduleData = {
  weeks: WeekSchedule[];
  currentWeekIndex: number;
};
