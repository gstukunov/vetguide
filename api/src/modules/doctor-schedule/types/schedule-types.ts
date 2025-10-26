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

export type ScheduleData = {
  weeks: WeekSchedule[];
  currentWeekIndex: number;
};
