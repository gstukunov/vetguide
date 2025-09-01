import { FC } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useHydration } from '@/(shared)/hooks';
import Button from '@/(shared)/ui/button';
import useAuthStore from '@/(stores)/auth';

import styles from './styles.module.scss';

export const AboutService: FC = () => {
  const { isAuthenticated } = useAuthStore();
  const isHydrated = useHydration();
  const { push } = useRouter();

  const handleClick = () => {
    push('/auth/sign-up');
  };

  return (
    <section className={styles.aboutService}>
      <div className={styles.aboutContent}>
        <div className={styles.aboutText}>
          <h2 className={styles.aboutTitle}>О сервисе</h2>
          <p className={styles.aboutParagraph}>
            ВетГид — это современная платформа для поиска и записи к
            ветеринарным специалистам. Мы помогаем владельцам домашних животных
            найти квалифицированных врачей, записаться на прием и получить
            качественную ветеринарную помощь.
          </p>
          {!isAuthenticated && isHydrated && (
            <Button onClick={handleClick}>Зарегистрироваться</Button>
          )}
        </div>
        <div className={styles.aboutImage}>
          <Image
            src="/about.png"
            alt="О сервисе VetGuide"
            width={500}
            height={400}
            priority
          />
        </div>
      </div>
    </section>
  );
};
