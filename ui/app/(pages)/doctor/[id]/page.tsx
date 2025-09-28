'use client';
import { useParams } from 'next/navigation';

import { useGetDoctor } from '@/(shared)/api/hooks/doctors';
import Header from '@/(shared)/ui/header';

import styles from './styles.module.scss';

const DoctorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetDoctor(id);

  return (
    <div className={styles.doctorPage}>
      <div className={styles.headerBlock}>
        <Header className={styles.header} />
      </div>
    </div>
  );
};

export default DoctorPage;
