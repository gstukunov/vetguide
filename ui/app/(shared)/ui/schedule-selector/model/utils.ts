import { DaySchedule, TimeSlot, WeekSchedule } from './types';

export const generateTimeSlots = (
  startHour: number = 9,
  endHour: number = 20
): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    slots.push({
      id: timeString,
      time: timeString,
      available: Math.random() > 0.3, // Randomly make some slots unavailable
    });
  }

  return slots;
};

export const generateWeekSchedule = (startDate: Date): WeekSchedule => {
  const days: DaySchedule[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const isToday = date.getTime() === today.getTime();

    days.push({
      date,
      dayOfWeek: date.toLocaleDateString('ru-RU', { weekday: 'long' }),
      dayOfWeekShort: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday,
      timeSlots: generateTimeSlots(),
    });
  }

  return {
    weekNumber: Math.ceil((startDate.getDate() - startDate.getDay() + 1) / 7),
    days,
  };
};

export const generateMultipleWeeks = (
  weeksCount: number = 4
): WeekSchedule[] => {
  const weeks: WeekSchedule[] = [];
  const today = new Date();

  // Start from the beginning of current week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

  for (let i = 0; i < weeksCount; i++) {
    const weekStart = new Date(startOfWeek);
    weekStart.setDate(startOfWeek.getDate() + i * 7);
    weeks.push(generateWeekSchedule(weekStart));
  }

  return weeks;
};
