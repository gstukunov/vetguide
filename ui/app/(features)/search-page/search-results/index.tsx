import { FC } from 'react';

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
    <div className={styles.doctorsGrid}>
      {data?.doctors.length ? (
        data?.doctors.map(doctor => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))
      ) : (
        <div>Ничего не найдено</div>
      )}
    </div>
  );
};
