export const parsePhone = (formatted: string): string => {
  const digits = formatted.replace(/\D/g, '');

  return `+7${digits.slice(1)}`;
};
