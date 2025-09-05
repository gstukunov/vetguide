'use client';

import { FC, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { AboutService, BestDoctors } from '@/(features)/main-page';
import { AuthIcon } from '@/(shared)/icons/auth';
import { SearchIcon } from '@/(shared)/icons/search';
import { Footer } from '@/(shared)/ui/footer';
import Header from '@/(shared)/ui/header';
import { Input } from '@/(shared)/ui/inputs';

import styles from './styles.module.scss';

const MainPage: FC = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSearch = (value: string) => {
    const query = value.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.headerBlock}>
            <Header className={styles.header} />
          </div>
          <div className={styles.searchBlock}>
            <div className={styles.searchWithInput}>
              <h1 className={styles.searchHeading}>
                Сервис для поиска ветеринаров
              </h1>
              <div className={styles.inputWithLabel}>
                <p className={styles.inputLabel}>
                  Выберите специалиста для вашего питомца
                </p>
                <Input
                  ref={inputRef}
                  className={styles.searchInput}
                  placeholder="Ветеринары, клиники, услуги"
                  icon={
                    <SearchIcon
                      width={27}
                      height={27}
                      onClick={() => {
                        const value = inputRef.current?.value ?? '';
                        handleSearch(value);
                      }}
                    />
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleSearch((e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </div>
            </div>
            <AuthIcon className={styles.mainIcon} />
          </div>
          <BestDoctors />
          <AboutService />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MainPage;
