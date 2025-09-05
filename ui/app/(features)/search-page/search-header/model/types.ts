export type SearchType = 'all' | 'doctors' | 'clinics';

export type SearchHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearchClick: () => void;
  onEnterPress: (value: string) => void;
  selectedType: SearchType;
  onTypeChange: (type: SearchType) => void;
};
