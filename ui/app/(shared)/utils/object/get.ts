// Functional utility to get a property value by key (shallow, no nesting)
export const get =
  <T>(key: keyof T) =>
  (obj: T): T[keyof T] =>
    obj[key];
