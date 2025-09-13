import { FC } from 'react';

import { ClinicCard } from '@/(shared)/ui/clinic-card';
import { DoctorCard } from '@/(shared)/ui/doctor-card';

import styles from './styles.module.scss';

import type { SearchResultsProps } from './model/types';

export const SearchResults: FC<SearchResultsProps> = ({
  data,
  isLoading,
  isError,
}) => {
  if (isLoading) return <div>Загрузка...</div>;
  if (isError) return <div>Ошибка при поиске</div>;

  return (
    <>
      {data?.doctors.length || data?.clinics.length ? (
        <div className={styles.doctorsGrid}>
          {data.doctors.map(doctor => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
          {data.clinics.map(clinic => (
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </div>
      ) : (
        <div>Ничего не найдено</div>
      )}
    </>
  );
};
