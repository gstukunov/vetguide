export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  // Remove leading 7 or 8 if present
  const clean = digits.replace(/^[78]/, '');
  let result = '+7';
  if (clean.length > 0) result += `(${clean.slice(0, 3)}`;
  if (clean.length >= 4) result += `)${clean.slice(3, 6)}`;
  if (clean.length >= 7) result += `-${clean.slice(6, 8)}`;
  if (clean.length >= 9) result += `-${clean.slice(8, 10)}`;
  return result;
}
