import { FC } from 'react';

import Image from 'next/image';

import { DogIcon } from '@/(shared)/icons/dog';
import Button from '@/(shared)/ui/button';

import { DoctorCardProps } from './model/types';
import styles from './styles.module.scss';

export const DoctorCard: FC<DoctorCardProps> = ({ doctor }) => {
  return (
    <div className={styles.doctorCard}>
      {doctor.photo ? (
        <Image
          src={doctor.photo}
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
      <div className={styles.doctorInfo}>
        <div className={styles.doctorNameAndRating}>
          <div className={styles.nameAndRating}>
            <h3 className={styles.doctorName}>{doctor.fullName}</h3>
            <div className={styles.rating}>
              <span className={styles.star}>★</span>
              <span className={styles.ratingValue}>
                {doctor.averageRating?.toFixed(1) || '0.0'}
              </span>
            </div>
          </div>
          <p className={styles.specialization}>
            {doctor.specialization?.[0] || 'Терапевт'}
          </p>
        </div>
        <div className={styles.clinicInfo}>
          <div className={styles.clinicNameAndAddress}>
            <p className={styles.clinicName}>{doctor.clinic.name}</p>
            <p className={styles.clinicAddress}>{doctor.clinic.address}</p>
          </div>
          <Button className={styles.bookButton}>Записаться</Button>
        </div>
      </div>
    </div>
  );
};
