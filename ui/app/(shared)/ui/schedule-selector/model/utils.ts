import { Appointment } from '@/(shared)/api/api';

import { DaySchedule, TimeSlot, WeekSchedule } from './types';

export type BookedSlot = {
  date: string;
  timeSlot: string;
  bookedByCurrentUser?: boolean;
};

/**
 * Converts appointments array to booked slots format
 */
export const appointmentsToBookedSlots = (
  appointments: Appointment[] = []
): BookedSlot[] => {
  return appointments
    .filter(
      appointment =>
        appointment.status === 'CONFIRMED' &&
        appointment.date &&
        appointment.timeSlot
    )
    .map(appointment => ({
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      // Note: Appointment type might not have bookedByCurrentUser,
      // so we set it to undefined. If needed, check Appointment interface.
      bookedByCurrentUser: undefined,
    }));
};

/**
 * Generates time slots for a given date, marking booked slots as unavailable
 * and disabling past time slots based on current time
 */
export const generateTimeSlots = (
  date: Date,
  bookedSlots: BookedSlot[] = [],
  startHour: number = 9,
  endHour: number = 20
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const now = new Date();

  // Normalize date to YYYY-MM-DD format using local time (not UTC) for comparison
  const dateYear = date.getFullYear();
  const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
  const dateDay = String(date.getDate()).padStart(2, '0');
  const dateStr = `${dateYear}-${dateMonth}-${dateDay}`;

  const todayYear = now.getFullYear();
  const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
  const todayDay = String(now.getDate()).padStart(2, '0');
  const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

  // Check if the date is today (using local date, not UTC)
  const isToday = dateStr === todayStr;

  for (let hour = startHour; hour < endHour; hour++) {
    const timeString = `${hour.toString().padStart(2, '0')}:00`;

    // Check if this slot is booked and if it's booked by current user
    const bookedSlot = bookedSlots.find(
      slot => slot.date === dateStr && slot.timeSlot === timeString
    );
    const isBooked = !!bookedSlot;
    const bookedByCurrentUser = bookedSlot?.bookedByCurrentUser ?? false;

    // Check if this time slot has already passed (only for today)
    let isPastTime = false;
    if (isToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      // Convert current time and slot time to minutes from midnight for comparison
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const slotTimeInMinutes = hour * 60;
      // If current time >= slot time, the slot is in the past
      isPastTime = currentTimeInMinutes >= slotTimeInMinutes;
    }

    slots.push({
      id: `${dateStr}_${timeString}`, // Unique ID combining date and time
      time: timeString,
      available: !isBooked && !isPastTime, // Available if not booked and not past time
      bookedByCurrentUser: isBooked ? bookedByCurrentUser : undefined,
    });
  }

  return slots;
};

/**
 * Generates a week schedule with time slots, taking booked slots into account
 */
export const generateWeekSchedule = (
  startDate: Date,
  bookedSlots: BookedSlot[] = []
): WeekSchedule => {
  const days: DaySchedule[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    date.setHours(0, 0, 0, 0); // Normalize to start of day

    // Compare dates by time value to determine if it's today
    const isToday = date.getTime() === today.getTime();

    days.push({
      date: new Date(date), // Create a new Date instance to avoid reference issues
      dayOfWeek: date.toLocaleDateString('ru-RU', { weekday: 'long' }),
      dayOfWeekShort: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday,
      timeSlots: generateTimeSlots(date, bookedSlots),
    });
  }

  // Calculate week number based on the first day of the week (Monday)
  const firstDayOfMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1
  );
  const daysFromMonthStart = Math.floor(
    (startDate.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weekNumber =
    Math.ceil((daysFromMonthStart + firstDayOfMonth.getDay() - 1) / 7) + 1;

  return {
    weekNumber,
    days,
  };
};

/**
 * Generates multiple weeks of schedule with booked slots taken into account
 * Starts from today if there are available slots today, otherwise starts from next week
 */
export const generateMultipleWeeks = (
  weeksCount: number = 4,
  bookedSlots: BookedSlot[] = []
): { weeks: WeekSchedule[]; currentWeekIndex: number } => {
  const weeks: WeekSchedule[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if today has any available slots
  const todaySlots = generateTimeSlots(today, bookedSlots);
  const hasAvailableSlotsToday = todaySlots.some(slot => slot.available);

  let startDate: Date;
  const currentWeekIndex = 0;

  if (hasAvailableSlotsToday) {
    // Start from today if there are available slots
    startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
  } else {
    // Start from next Monday if no available slots today
    const dayOfWeek = today.getDay();
    let daysToNextMonday: number;

    if (dayOfWeek === 1) {
      // Today is Monday, but no slots available, start from next Monday
      daysToNextMonday = 7;
    } else if (dayOfWeek === 0) {
      // Today is Sunday, next Monday is tomorrow (1 day)
      daysToNextMonday = 1;
    } else {
      // Today is Tuesday-Saturday, calculate days to next Monday
      // For example: Tuesday (2) -> Monday is in 6 days (8 - 2 = 6)
      daysToNextMonday = 8 - dayOfWeek;
    }

    startDate = new Date(today);
    startDate.setDate(today.getDate() + daysToNextMonday);
    startDate.setHours(0, 0, 0, 0);
  }

  // Generate weeks starting from startDate
  for (let i = 0; i < weeksCount; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + i * 7);
    const week = generateWeekSchedule(weekStart, bookedSlots);

    // Check if this week contains today (for highlighting)
    const hasToday = week.days.some(day => day.isToday);
    if (hasToday) {
      // Update isToday flag for the day
      week.days.forEach(day => {
        if (day.isToday) {
          // Re-generate slots to ensure past times are disabled
          day.timeSlots = generateTimeSlots(day.date, bookedSlots);
        }
      });
    }

    weeks.push(week);
  }

  return { weeks, currentWeekIndex };
};

/**
 * Generates schedule from backend response format (weeks with days)
 * This transforms the backend response to include generated time slots
 * Accepts both date strings (from raw API) and Date objects (from transformed API)
 */
export const generateScheduleFromBackendData = (
  backendWeeks: Array<{
    weekNumber: number;
    days: Array<{
      date: string | Date;
      dayOfWeek: string;
      dayOfWeekShort: string;
      dayNumber: number;
      isToday: boolean;
    }>;
  }>,
  bookedSlots: BookedSlot[] = [],
  currentWeekIndex: number = 0
): { weeks: WeekSchedule[]; currentWeekIndex: number } => {
  const weeks: WeekSchedule[] = backendWeeks.map(week => ({
    weekNumber: week.weekNumber,
    days: week.days.map(day => {
      // Handle both Date objects and date strings
      const date =
        day.date instanceof Date
          ? new Date(day.date)
          : new Date(day.date as string);
      date.setHours(0, 0, 0, 0);

      return {
        date,
        dayOfWeek: day.dayOfWeek,
        dayOfWeekShort: day.dayOfWeekShort,
        dayNumber: day.dayNumber,
        isToday: day.isToday,
        timeSlots: generateTimeSlots(date, bookedSlots),
      };
    }),
  }));

  return {
    weeks,
    currentWeekIndex,
  };
};
