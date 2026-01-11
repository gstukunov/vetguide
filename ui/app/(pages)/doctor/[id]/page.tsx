'use client';
import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import clsx from 'clsx';

import { useCreateAppointment } from '@/(shared)/api/hooks/appointments';
import { useGetDoctor } from '@/(shared)/api/hooks/doctors';
import { isAuthenticated } from '@/(shared)/api/requestBase';
import { DogIcon } from '@/(shared)/icons/dog';
import { AppointmentModal } from '@/(shared)/ui/appointment-modal/index';
import Button from '@/(shared)/ui/button';
import { Footer } from '@/(shared)/ui/footer';
import Header from '@/(shared)/ui/header';
import { formatPhoneNumber } from '@/(shared)/ui/inputs/phone-input/model/utils';
import { ScheduleSelector } from '@/(shared)/ui/schedule-selector';
import { useScheduleData } from '@/(shared)/ui/schedule-selector/hooks/useScheduleData';
import {
  appointmentsToBookedSlots,
  generateMultipleWeeks,
} from '@/(shared)/ui/schedule-selector/model/utils';

import styles from './styles.module.scss';

const DoctorPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: doctor } = useGetDoctor(id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutate: createAppointment } = useCreateAppointment();

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

  const handleConfirmBooking = () => {
    // Проверяем авторизацию
    if (!isAuthenticated()) {
      router.push('/auth/sign-in');
      return;
    }

    if (!selectedDate || !selectedTimeSlot || !doctor || !canBookAppointment) {
      console.error(
        'Cannot book appointment: missing data or slot not available'
      );
      return;
    }

    // Форматируем дату в формат YYYY-MM-DD используя локальное время (не UTC)
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Проверяем формат timeSlot (должен быть HH:mm)
    // selectedTimeSlot уже в формате HH:mm из generateTimeSlots

    createAppointment(
      {
        doctorId: doctor.id,
        date: dateStr, // YYYY-MM-DD format
        timeSlot: selectedTimeSlot, // HH:mm format
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          handleTimeSlotSelect('');
          // Можно добавить уведомление об успешной записи
        },
        onError: (error: unknown) => {
          console.error('Failed to create appointment:', error);
          // Можно добавить уведомление об ошибке
        },
      }
    );
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
