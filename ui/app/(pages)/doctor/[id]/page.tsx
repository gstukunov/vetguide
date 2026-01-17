'use client';
import { useEffect, useMemo, useState } from 'react';

import { useParams } from 'next/navigation';

import { clsx } from 'clsx';

import { AppointmentBooking } from '@/(features)/appointment';
import {
  AppointmentSection,
  ClinicInfo,
  DoctorDescription,
  DoctorHeader,
} from '@/(features)/doctor-page';
import { useConfirmBooking } from '@/(shared)/api/hooks/appointments';
import { useGetDoctor } from '@/(shared)/api/hooks/doctors';
import { Footer } from '@/(shared)/ui/footer';
import Header from '@/(shared)/ui/header';
import { useScheduleData } from '@/(shared)/ui/schedule-selector/hooks/useScheduleData';
import {
  appointmentsToBookedSlots,
  generateMultipleWeeks,
} from '@/(shared)/ui/schedule-selector/model/utils';

import styles from './styles.module.scss';

const DoctorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: doctor } = useGetDoctor(id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    scheduleData,
    selectedDate,
    selectedTimeSlot,
    handleWeekChange,
    handleDateSelect,
    handleTimeSlotSelect,
    updateWeeks,
    setCurrentWeekIndex,
  } = useScheduleData();

  // Генерируем расписание клиентской стороны из данных врача и записей (appointments)
  useEffect(() => {
    if (doctor) {
      // Получаем забронированные слоты из bookedTimeslots (имеет bookedByCurrentUser флаг)
      // Если bookedTimeslots не доступны, используем appointments для обратной совместимости
      const bookedSlots =
        doctor.bookedTimeslots ||
        (doctor.appointments
          ? appointmentsToBookedSlots(doctor.appointments)
          : []);

      // Генерируем расписание клиентской стороны (4 недели) с учетом забронированных слотов
      const { weeks, currentWeekIndex } = generateMultipleWeeks(4, bookedSlots);

      // Устанавливаем неделю, которая содержит сегодня
      setCurrentWeekIndex(currentWeekIndex);
      updateWeeks(weeks, currentWeekIndex);
    }
  }, [doctor, updateWeeks, setCurrentWeekIndex]);

  // Проверяем, что выбранные дата и время доступны для бронирования
  const canBookAppointment = useMemo(() => {
    if (!selectedDate || !selectedTimeSlot || !doctor) return false;

    const selectedDateStr = selectedDate.toISOString().split('T')[0];

    for (const week of scheduleData.weeks) {
      for (const day of week.days) {
        const dayDateStr = day.date.toISOString().split('T')[0];
        if (dayDateStr === selectedDateStr) {
          const slot = day.timeSlots.find(
            slot => slot.time === selectedTimeSlot
          );
          if (slot && slot.available) {
            return true;
          }
        }
      }
    }
    return false;
  }, [selectedDate, selectedTimeSlot, scheduleData.weeks, doctor]);

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

  const { confirmBooking } = useConfirmBooking({
    doctor,
    selectedDate,
    selectedTimeSlot,
    canBookAppointment,
    onSuccess: () => {
      setIsModalOpen(false);
      handleTimeSlotSelect('');
    },
  });

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
          <DoctorHeader doctor={doctor} />
          <DoctorDescription doctor={doctor} />
          <div className={styles.doctorLineContainer}>
            <div className={styles.doctorLine} />
            <div className={styles.appointmentContainer}>
              <div className={styles.appointmentTitle}>Запись на прием</div>
              <ClinicInfo clinic={doctor?.clinic} />
              <AppointmentSection
                weeks={scheduleData.weeks}
                currentWeekIndex={scheduleData.currentWeekIndex}
                selectedDate={selectedDate}
                selectedTimeSlot={selectedTimeSlot}
                onDateSelect={handleDateClick}
                onTimeSlotSelect={handleTimeSlotClick}
                onWeekChange={handleWeekChange}
                onMobileBooking={handleMobileBooking}
              />
            </div>
            <div className={styles.doctorLine} />
          </div>
        </div>
      </div>
      <Footer />

      {doctor?.clinic && doctor && (
        <AppointmentBooking
          isOpen={isModalOpen}
          onClose={handleModalClose}
          doctor={doctor}
          clinic={doctor?.clinic}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          onConfirmBooking={confirmBooking}
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
