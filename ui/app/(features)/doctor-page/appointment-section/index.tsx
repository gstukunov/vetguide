import React from 'react';

import Button from '@/(shared)/ui/button';
import { ScheduleSelector } from '@/(shared)/ui/schedule-selector';

import { AppointmentSectionProps } from './model/types';
import styles from './styles.module.scss';

export const AppointmentSection: React.FC<AppointmentSectionProps> = ({
  weeks,
  currentWeekIndex,
  selectedDate,
  selectedTimeSlot,
  onDateSelect,
  onTimeSlotSelect,
  onWeekChange,
  onMobileBooking,
}) => {
  return (
    <div className={styles.appointmentSection}>
      <div className={styles.scheduleSection}>
        <ScheduleSelector
          weeks={weeks}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          onDateSelect={onDateSelect}
          onTimeSlotSelect={onTimeSlotSelect}
          onWeekChange={onWeekChange}
          currentWeekIndex={currentWeekIndex}
          title="Доступные даты"
        />
      </div>
      {selectedDate && selectedTimeSlot && (
        <div className={styles.fixedBottomButton}>
          <Button
            colorType="secondary"
            className={styles.bookAppointmentButton}
            onClick={onMobileBooking}
          >
            Записаться на прием
          </Button>
        </div>
      )}
    </div>
  );
};
