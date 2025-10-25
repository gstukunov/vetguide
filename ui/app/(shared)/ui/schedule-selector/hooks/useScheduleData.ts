import { useCallback, useMemo, useState } from 'react';

import { ScheduleData, WeekSchedule } from '../model/types';

export const useScheduleData = (initialWeeks: WeekSchedule[] = []) => {
  const [weeks, setWeeks] = useState<WeekSchedule[]>(initialWeeks);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<
    string | undefined
  >();

  const scheduleData: ScheduleData = useMemo(
    () => ({
      weeks,
      currentWeekIndex,
    }),
    [weeks, currentWeekIndex]
  );

  const handleWeekChange = useCallback(
    (direction: 'prev' | 'next') => {
      if (direction === 'prev' && currentWeekIndex > 0) {
        setCurrentWeekIndex(currentWeekIndex - 1);
      } else if (direction === 'next' && currentWeekIndex < weeks.length - 1) {
        setCurrentWeekIndex(currentWeekIndex + 1);
      }
    },
    [currentWeekIndex, weeks.length]
  );

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(undefined); // Reset time slot when date changes
  }, []);

  const handleTimeSlotSelect = useCallback((timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  }, []);

  const addWeeks = useCallback((newWeeks: WeekSchedule[]) => {
    setWeeks(prev => [...prev, ...newWeeks]);
  }, []);

  const updateWeeks = useCallback(
    (updatedWeeks: WeekSchedule[]) => {
      setWeeks(updatedWeeks);

      // Auto-select today or first available day
      if (updatedWeeks.length > 0) {
        const currentWeek = updatedWeeks[currentWeekIndex];
        if (currentWeek && currentWeek.days.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Try to find today first
          const todayDay = currentWeek.days.find(
            day => day.date.getTime() === today.getTime()
          );

          if (todayDay) {
            setSelectedDate(todayDay.date);
          } else {
            // If today is not in current week, select the first day
            setSelectedDate(currentWeek.days[0].date);
          }
        }
      }
    },
    [currentWeekIndex]
  );

  return {
    scheduleData,
    selectedDate,
    selectedTimeSlot,
    handleWeekChange,
    handleDateSelect,
    handleTimeSlotSelect,
    addWeeks,
    updateWeeks,
    setCurrentWeekIndex,
  };
};
