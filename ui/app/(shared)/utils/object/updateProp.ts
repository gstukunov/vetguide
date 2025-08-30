export const updateProp =
  <T>(key: keyof T) =>
  (value: T[keyof T]) =>
  (obj: T): T => ({
    ...obj,
    [key]: value,
  });
