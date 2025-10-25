'use client';
import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useParams } from 'next/navigation';

import clsx from 'clsx';

import { useGetDoctor } from '@/(shared)/api/hooks/doctors';
import { DogIcon } from '@/(shared)/icons/dog';
import { AppointmentModal } from '@/(shared)/ui/appointment-modal/index';
import Button from '@/(shared)/ui/button';
import { Footer } from '@/(shared)/ui/footer';
import Header from '@/(shared)/ui/header';
import { formatPhoneNumber } from '@/(shared)/ui/inputs/phone-input/model/utils';
import { ScheduleSelector } from '@/(shared)/ui/schedule-selector';
import { useScheduleData } from '@/(shared)/ui/schedule-selector/hooks/useScheduleData';
import { generateMultipleWeeks } from '@/(shared)/ui/schedule-selector/model/utils';

import styles from './styles.module.scss';

const DoctorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: doctor } = useGetDoctor(id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    scheduleData,
    selectedDate,
    selectedTimeSlot,
    handleWeekChange,
    handleDateSelect,
    handleTimeSlotSelect,
    updateWeeks,
  } = useScheduleData();

  useEffect(() => {
    const initialWeeks = generateMultipleWeeks(4);
    updateWeeks(initialWeeks);
  }, [updateWeeks]);

  const handleDateClick = (date: Date) => {
    handleDateSelect(date);
  };

  const handleTimeSlotClick = (timeSlot: string) => {
    handleTimeSlotSelect(timeSlot);

    if (window.innerWidth > 768) {
      setIsModalOpen(true);
    }
  };

  const handleMobileBooking = () => {
    if (selectedDate && selectedTimeSlot) {
      setIsModalOpen(true);
    }
  };

  const handleConfirmBooking = () => {
    console.log('Booking confirmed:', {
      doctor: doctor?.fullName,
      date: selectedDate,
      time: selectedTimeSlot,
    });
    setIsModalOpen(false);
    // Here you would typically make an API call to book the appointment
  };

  // Handle modal close - clear time slot selection
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Clear time slot selection when modal is closed without action
    handleTimeSlotSelect('');
  };

  return (
    <div
      className={clsx(styles.doctorPage, { [styles.modalOpen]: isModalOpen })}
    >
      <div className={styles.headerBlock}>
        <Header className={styles.header} />
      </div>
      <div className={styles.doctorBlock}>
        <div className={styles.doctorInfo}>
          <div className={styles.doctorPhotoContainer}>
            <div className={styles.doctorPhoto}>
              {doctor && doctor.photoUrl ? (
                <Image
                  src={doctor?.photoUrl}
                  className={styles.avatarImage}
                  alt={doctor.fullName}
                  width={100}
                  height={100}
                />
              ) : (
                <div className={styles.avatar}>
                  <DogIcon />
                </div>
              )}
            </div>
            <div className={styles.doctorNameContainer}>
              <div className={styles.doctorName}>{doctor?.fullName}</div>
              <div className={styles.doctorSpecializationContainer}>
                {doctor?.specialization?.map(spec => (
                  <div
                    key={`doctor-spec-${spec}`}
                    className={styles.doctorSpecialization}
                  >
                    {spec}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.doctorDescriptionContainer}>
            <div className={styles.doctorAbout}>О враче</div>
            <div className={styles.doctorDescription}>
              {doctor?.description}
            </div>
          </div>
          <div className={styles.doctorLineContainer}>
            <div className={styles.doctorLine} />
            <div className={styles.doctorClinicContainer}>
              <div className={styles.doctorClinicTitle}>Запись на прием</div>
              <div className={styles.doctorClinicInfoWithLogo}>
                <div className={styles.clinicAvatar}>Лого</div>
                <div className={styles.doctorClinic}>
                  {doctor?.clinic?.name}
                </div>
              </div>
              <div className={styles.doctorClinicAddressContainer}>
                <div className={styles.doctorClinicAddressHeader}>Адрес</div>
                <div className={styles.doctorClinicAddress}>
                  {doctor?.clinic?.address}
                </div>
              </div>
              <div className={styles.doctorClinicAddressContainer}>
                <div className={styles.doctorClinicAddressHeader}>Телефон</div>
                <a
                  href={`tel:${doctor?.clinic?.phone}`}
                  className={styles.doctorClinicPhone}
                >
                  {formatPhoneNumber(doctor?.clinic?.phone || '')}
                </a>
              </div>
              <div className={styles.scheduleSection}>
                <ScheduleSelector
                  weeks={scheduleData.weeks}
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  onDateSelect={handleDateClick}
                  onTimeSlotSelect={handleTimeSlotClick}
                  onWeekChange={handleWeekChange}
                  currentWeekIndex={scheduleData.currentWeekIndex}
                  title="Доступные даты"
                />
              </div>
            </div>
            <div className={styles.doctorLine} />
          </div>
        </div>
      </div>
      <Footer />

      {selectedDate && selectedTimeSlot && (
        <div className={styles.fixedBottomButton}>
          <Button
            colorType="secondary"
            className={styles.bookAppointmentButton}
            onClick={handleMobileBooking}
          >
            Записаться на прием
          </Button>
        </div>
      )}

      {doctor?.clinic && doctor && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          doctor={doctor}
          clinic={doctor?.clinic}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          onConfirmBooking={handleConfirmBooking}
          weeks={scheduleData.weeks}
          currentWeekIndex={scheduleData.currentWeekIndex}
          onDateSelect={handleDateSelect}
          onTimeSlotSelect={handleTimeSlotSelect}
          onWeekChange={handleWeekChange}
        />
      )}
    </div>
  );
};
export default DoctorPage;
