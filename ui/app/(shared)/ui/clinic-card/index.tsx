import { FC } from 'react';

import { ClinicCardProps } from './model/types';
import styles from './styles.module.scss';

export const ClinicCard: FC<ClinicCardProps> = ({ clinic }) => {
  return (
    <div className={styles.doctorCard}>
      <div className={styles.avatar}>Лого</div>
      <div className={styles.doctorInfo}>
        <h3 className={styles.doctorName}>{clinic.name}</h3>
        <p className={styles.doctorAddress}>{clinic.address}</p>
      </div>
    </div>
  );
};
