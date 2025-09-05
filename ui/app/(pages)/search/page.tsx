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

import { SearchHeader, SearchResults } from '@/(features)/search-page';
import { useSearch } from '@/(shared)/api/hooks/search';
import { Footer } from '@/(shared)/ui/footer';
import Header from '@/(shared)/ui/header';

import styles from './styles.module.scss';

type SearchType = 'all' | 'doctors' | 'clinics';

const SearchPage = () => {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get('q') || '';
  const typeParam = (params.get('type') as SearchType) || 'all';

  const [localQuery, setLocalQuery] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalQuery(q);
  }, [q]);

  const enabled = useMemo(() => Boolean(q.trim()), [q]);

  const { data, isLoading, isError } = useSearch(q, enabled, typeParam);

  const commitSearch = useCallback(
    (value: string, type: SearchType, replace: boolean = true) => {
      const query = value.trim();
      if (!query) return;
      const qs = new URLSearchParams();
      qs.set('q', query);
      if (type && type !== 'all') qs.set('type', type);
      const url = `/search?${qs.toString()}`;
      if (replace) router.replace(url);
      else router.push(url);
    },
    [router]
  );

  const handleInputChange = (value: string) => {
    setLocalQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) commitSearch(value, typeParam, true);
    }, 400);
  };

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    commitSearch(value, typeParam, true);
  };

  const onCategoryClick = (next: SearchType) => {
    commitSearch(localQuery, next, true);
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.headerBlock}>
            <Header className={styles.header} />
          </div>
          <SearchHeader
            query={localQuery}
            onQueryChange={handleInputChange}
            onSearchClick={() => handleSearch(localQuery)}
            onEnterPress={value => handleSearch(value)}
            selectedType={typeParam}
            onTypeChange={onCategoryClick}
          />
          {isLoading && <div>Загрузка...</div>}
          {isError && <div>Ошибка при поиске</div>}

          <SearchResults data={data} isLoading={isLoading} isError={isError} />
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
