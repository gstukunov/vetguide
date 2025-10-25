import React, { useState } from 'react';

import Image from 'next/image';

import clsx from 'clsx';

import { DogIcon } from '@/(shared)/icons/dog';
import Button from '@/(shared)/ui/button';
import { ScheduleSelector } from '@/(shared)/ui/schedule-selector';

import { AppointmentModalProps } from './model/types';
import styles from './styles.module.scss';

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  doctor,
  clinic,
  selectedDate,
  selectedTimeSlot,
  onConfirmBooking,
  weeks,
  currentWeekIndex,
  onDateSelect,
  onTimeSlotSelect,
  onWeekChange,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  if (!isOpen) return null;

  return (
    <div
      className={clsx(styles.modalOverlay, { [styles.closing]: isClosing })}
      onClick={handleClose}
    >
      <div
        className={clsx(styles.modal, { [styles.closing]: isClosing })}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.doctorInfo}>
          <div className={styles.doctorPhoto}>
            {doctor?.photoUrl ? (
              <Image
                src={doctor.photoUrl}
                alt={doctor.fullName}
                width={80}
                height={80}
                className={styles.doctorImage}
              />
            ) : (
              <div className={styles.doctorAvatar}>
                <DogIcon />
              </div>
            )}
          </div>
          <div className={styles.doctorDetails}>
            <h3 className={styles.doctorName}>{doctor?.fullName}</h3>
            <div className={styles.specializations}>
              {doctor?.specialization?.map((spec, index) => (
                <span key={index} className={styles.specialization}>
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.clinicInfo}>
          <div className={styles.clinicLogo}>Лого</div>
          <div className={styles.clinicDetails}>
            <div className={styles.clinicName}>{clinic.name}</div>
            <div className={styles.clinicAddress}>{clinic?.address}</div>
          </div>
        </div>

        <div className={styles.scheduleSection}>
          <ScheduleSelector
            weeks={weeks}
            currentWeekIndex={currentWeekIndex}
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            onDateSelect={onDateSelect}
            onTimeSlotSelect={onTimeSlotSelect}
            onWeekChange={onWeekChange}
          />
        </div>

        <div className={styles.bookingSection}>
          <Button
            colorType="secondary"
            className={styles.confirmButton}
            onClick={onConfirmBooking}
          >
            Записаться на прием
          </Button>
        </div>

        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
};
