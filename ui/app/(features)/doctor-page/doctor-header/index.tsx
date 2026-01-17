import React from 'react';

import Image from 'next/image';

import { DogIcon } from '@/(shared)/icons/dog';

import { DoctorHeaderProps } from './model/types';
import styles from './styles.module.scss';

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({ doctor }) => {
  return (
    <div className={styles.doctorPhotoContainer}>
      <div className={styles.doctorPhoto}>
        {doctor && doctor.photoUrl ? (
          <Image
            src={doctor.photoUrl}
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
            <div key={`doctor-spec-${spec}`} className={styles.doctorSpecialization}>
              {spec}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
