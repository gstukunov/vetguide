import React from 'react';

import { ScheduleSelectorProps } from './model/types';
import styles from './styles.module.scss';

export const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  weeks,
  selectedDate,
  selectedTimeSlot,
  onDateSelect,
  onTimeSlotSelect,
  onWeekChange,
  currentWeekIndex,
  title = 'Доступные даты',
  monthName,
}) => {
  const currentWeek =
    weeks &&
    weeks.length > 0 &&
    currentWeekIndex >= 0 &&
    currentWeekIndex < weeks.length
      ? weeks[currentWeekIndex]
      : undefined;
  const currentMonth =
    monthName ||
    currentWeek?.days[0]?.date.toLocaleDateString('ru-RU', { month: 'long' });

  if (!currentWeek || !currentWeek.days || currentWeek.days.length === 0) {
    return <div>Загрузка расписания...</div>;
  }

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  const handleTimeSlotClick = (timeSlot: string) => {
    onTimeSlotSelect(timeSlot);
  };

  const handlePrevWeek = () => {
    onWeekChange('prev');
  };

  const handleNextWeek = () => {
    onWeekChange('next');
  };

  return (
    <div className={styles.scheduleSelector}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.month}>{currentMonth}</div>
      </div>

      <div className={styles.dateSelector}>
        <button
          className={styles.navButton}
          onClick={handlePrevWeek}
          disabled={currentWeekIndex === 0}
        >
          &lt;
        </button>

        <div
          className={styles.datesContainer}
          data-testid="dates-container"
          style={{
            minHeight: '60px', // Ensure container has minimum height
          }}
        >
          {currentWeek.days.length === 0 && <div>No days available</div>}
          {currentWeek.days.map((day, index) => {
            const hasAvailableSlots =
              day.timeSlots?.some(slot => slot.available) ?? false;
            const isDisabled = !hasAvailableSlots;

            // Debug first day
            if (index === 0) {
              console.log('🔍 Rendering first day:', {
                date: day.date,
                dayNumber: day.dayNumber,
                dayOfWeekShort: day.dayOfWeekShort,
                timeSlotsCount: day.timeSlots?.length ?? 0,
                hasAvailableSlots,
                isDisabled,
              });
            }

            return (
              <button
                key={day.date.toISOString()}
                className={`${styles.dateButton} ${day.isToday ? styles.today : ''} ${isDisabled ? styles.disabled : ''} ${
                  selectedDate &&
                  day.date.toDateString() === selectedDate.toDateString()
                    ? styles.selected
                    : ''
                }`}
                onClick={() => {
                  if (!isDisabled) {
                    handleDateClick(day.date);
                  }
                }}
                disabled={isDisabled}
                aria-disabled={isDisabled}
              >
                <div className={styles.dateContent}>
                  {day.isToday ? (
                    <>
                      <div className={styles.todayLabel}>Сегодня</div>
                      <div className={styles.dayOfWeek}>
                        {day.dayOfWeekShort || '—'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.dayNumber}>{day.dayNumber}</div>
                      <div className={styles.dayOfWeek}>
                        {day.dayOfWeekShort || '—'}
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          className={styles.navButton}
          onClick={handleNextWeek}
          disabled={currentWeekIndex === weeks.length - 1}
        >
          &gt;
        </button>
      </div>

      <div className={styles.timeSlotsGrid}>
        {currentWeek.days.map(day => {
          const isSelectedDay =
            selectedDate &&
            day.date.toDateString() === selectedDate.toDateString();

          if (!isSelectedDay) return null;

          return day.timeSlots.map(slot => (
            <button
              key={slot.id}
              className={`${styles.timeSlot} ${slot.available ? styles.available : styles.unavailable} ${
                slot.bookedByCurrentUser ? styles.bookedByUser : ''
              } ${selectedTimeSlot === slot.time ? styles.selected : ''}`}
              onClick={() => slot.available && handleTimeSlotClick(slot.time)}
              disabled={!slot.available}
              title={
                slot.bookedByCurrentUser
                  ? 'Забронировано вами'
                  : !slot.available
                    ? 'Недоступно'
                    : ''
              }
            >
              {slot.time}
            </button>
          ));
        })}
      </div>
    </div>
  );
};
