import { FC } from 'react';

import { clsx } from 'clsx';

import { SearchIcon } from '@/(shared)/icons/search';
import { Input } from '@/(shared)/ui/inputs';

import { SEARCH_CATEGORIES } from './model/constants';
import styles from './styles.module.scss';

import type { SearchHeaderProps, SearchType } from './model/types';

export const SearchHeader: FC<SearchHeaderProps> = ({
  query,
  onQueryChange,
  onSearchClick,
  onEnterPress,
  selectedType,
  onTypeChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQueryChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEnterPress((e.target as HTMLInputElement).value);
    }
  };

  const getCategoryClass = (type: SearchType) =>
    clsx(styles.categoryButton, {
      [styles.categoryButtonActive]: selectedType === type,
    });

  const handleCategoryClick = (type: SearchType) => () => {
    onTypeChange(type);
  };

  return (
    <div className={styles.searchWithInput}>
      <h1 className={styles.searchHeading}>
        Найдите специалиста для вашего питомца
      </h1>
      <h1 className={styles.searchHeadingMobile}>Поиск</h1>
      <div className={styles.searchInputContainer}>
        <Input
          className={styles.searchInput}
          placeholder="Ветеринары, клиники, услуги"
          value={query}
          onChange={handleChange}
          icon={
            <SearchIcon
              width={27}
              height={27}
              className={styles.searchIcon}
              onClick={onSearchClick}
            />
          }
          onKeyDown={handleKeyDown}
        />
        <div className={styles.categories}>
          {SEARCH_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              type="button"
              className={getCategoryClass(cat.key)}
              onClick={handleCategoryClick(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
