import { FC } from 'react';

import { TelegramIcon } from '@/(shared)/icons/telegram';
import { WhatsUpIcon } from '@/(shared)/icons/whatsup';

import styles from './styles.module.scss';

export const Footer: FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.brandSection}>
          <h2 className={styles.brandName}>ВЕТГИД</h2>
        </div>

        <div className={styles.contactsSection}>
          <h3 className={styles.contactsTitle}>Контакты</h3>
          <p className={styles.contactsDescription}>
            Если у вас есть вопросы или возникли сложности с использованием
            сервиса, напишите нам:
          </p>
          <div className={styles.contactIcons}>
            <TelegramIcon
              width={42}
              height={42}
              className={styles.contactIcon}
            />
            <WhatsUpIcon
              width={42}
              height={42}
              className={styles.contactIcon}
            />
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.privacyPolicy}>Политика конфиденциальности</p>
        <p className={styles.copyright}>©2025 Ветгид</p>
      </div>
    </footer>
  );
};
