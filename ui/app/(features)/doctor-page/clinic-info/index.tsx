import React from 'react';

import { formatPhoneNumber } from '@/(shared)/ui/inputs/phone-input/model/utils';

import { ClinicInfoProps } from './model/types';
import styles from './styles.module.scss';

export const ClinicInfo: React.FC<ClinicInfoProps> = ({ clinic }) => {
  if (!clinic) return null;

  return (
    <div className={styles.clinicInfoContainer}>
      <div className={styles.clinicInfoWithLogo}>
        <div className={styles.clinicAvatar}>Лого</div>
        <div className={styles.clinicName}>{clinic.name}</div>
      </div>
      <div className={styles.clinicAddressContainer}>
        <div className={styles.clinicAddressHeader}>Адрес</div>
        <div className={styles.clinicAddress}>{clinic.address}</div>
      </div>
      <div className={styles.clinicAddressContainer}>
        <div className={styles.clinicAddressHeader}>Телефон</div>
        <a href={`tel:${clinic.phone}`} className={styles.clinicPhone}>
          {formatPhoneNumber(clinic.phone || '')}
        </a>
      </div>
    </div>
  );
};
