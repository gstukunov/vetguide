'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { useSearch } from '@/(shared)/api/hooks/search';
import { SearchIcon } from '@/(shared)/icons/search';
import { DoctorCard } from '@/(shared)/ui/doctor-card';
import { Footer } from '@/(shared)/ui/footer';
import Header from '@/(shared)/ui/header';
import { Input } from '@/(shared)/ui/inputs';

import styles from './styles.module.scss';

const SearchPage = () => {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get('q') || '';

  const [localQuery, setLocalQuery] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalQuery(q);
  }, [q]);

  const enabled = useMemo(() => Boolean(q.trim()), [q]);

  const { data, isLoading, isError } = useSearch(q, enabled);

  const commitSearch = useCallback(
    (value: string, replace: boolean = true) => {
      const query = value.trim();
      if (!query) return;
      const url = `/search?q=${encodeURIComponent(query)}`;
      if (replace) router.replace(url);
      else router.push(url);
    },
    [router]
  );

  const handleInputChange = (value: string) => {
    setLocalQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) commitSearch(value, true);
    }, 400);
  };

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    commitSearch(value, true);
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.headerBlock}>
            <Header className={styles.header} />
          </div>
          <div className={styles.searchWithInput}>
            <h1 className={styles.searchHeading}>
              Найдите специалиста для вашего питомца
            </h1>
            <h1 className={styles.searchHeadingMobile}>Поиск</h1>
            <Input
              className={styles.searchInput}
              placeholder="Ветеринары, клиники, услуги"
              value={localQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange(e.target.value)
              }
              icon={
                <SearchIcon
                  width={27}
                  height={27}
                  className={styles.searchIcon}
                  onClick={() => handleSearch(localQuery)}
                />
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  handleSearch((e.target as HTMLInputElement).value);
                }
              }}
            />
          </div>
          {isLoading && <div>Загрузка...</div>}
          {isError && <div>Ошибка при поиске</div>}

          {!isLoading && !isError && (
            <div className={styles.doctorsGrid}>
              {data?.doctors?.length ? (
                data.doctors.map(doctor => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))
              ) : (
                <div>Ничего не найдено</div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default function SearchPageWrapped() {
  return (
    <Suspense fallback={<div>Ошибка при поиске</div>}>
      <SearchPage />
    </Suspense>
  );
}
