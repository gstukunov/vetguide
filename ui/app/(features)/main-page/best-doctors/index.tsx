import { FC } from 'react';

import { useGetTopDoctors } from '@/(shared)/api/hooks/doctors';
import { DoctorCard } from '@/(shared)/ui/doctor-card';

import styles from './styles.module.scss';

export const BestDoctors: FC = () => {
  const { data: doctors, isLoading, error } = useGetTopDoctors();

  if (isLoading) {
    return (
      <section className={styles.bestDoctors}>
        <h2 className={styles.title}>Лучшие специалисты</h2>
        <div className={styles.loading}>Загрузка...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.bestDoctors}>
        <h2 className={styles.title}>Лучшие специалисты</h2>
        <div className={styles.error}>Ошибка загрузки данных</div>
      </section>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <section className={styles.bestDoctors}>
        <h2 className={styles.title}>Лучшие специалисты</h2>
        <div className={styles.empty}>Специалисты не найдены</div>
      </section>
    );
  }

  // Take only top 6 doctors
  const topDoctors = doctors.slice(0, 6);

  return (
    <section className={styles.bestDoctors}>
      <h2 className={styles.title}>Лучшие специалисты</h2>
      <div className={styles.doctorsGrid}>
        {topDoctors.map(doctor => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </section>
  );
};
