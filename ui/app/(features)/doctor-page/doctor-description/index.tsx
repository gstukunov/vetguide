import React from 'react';

import { DoctorDescriptionProps } from './model/types';
import styles from './styles.module.scss';

export const DoctorDescription: React.FC<DoctorDescriptionProps> = ({
  doctor,
}) => {
  return (
    <div className={styles.doctorDescriptionContainer}>
      <div className={styles.doctorAbout}>О враче</div>
      <div className={styles.doctorDescription}>{doctor?.description}</div>
    </div>
  );
};
