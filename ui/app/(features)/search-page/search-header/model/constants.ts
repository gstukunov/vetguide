import type { SearchType } from './types';

export const SEARCH_CATEGORIES: { key: SearchType; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'doctors', label: 'Врачи' },
  { key: 'clinics', label: 'Клиники' },
];
