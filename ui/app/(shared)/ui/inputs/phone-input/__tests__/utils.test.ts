import { formatPhoneNumber } from '../model/utils';

describe('formatPhoneNumber', () => {
  it('formats a plain number correctly', () => {
    expect(formatPhoneNumber('1234567890')).toBe('+7(123)456-78-90');
  });

  it('removes non-digit characters', () => {
    expect(formatPhoneNumber('1a2b3c4d5e6f7g8h9i0j')).toBe('+7(123)456-78-90');
  });

  it('ignores leading 7 or 8', () => {
    expect(formatPhoneNumber('81234567890')).toBe('+7(123)456-78-90');
    expect(formatPhoneNumber('71234567890')).toBe('+7(123)456-78-90');
  });

  it('handles short input', () => {
    expect(formatPhoneNumber('1')).toBe('+7(1');
    expect(formatPhoneNumber('12')).toBe('+7(12');
    expect(formatPhoneNumber('123')).toBe('+7(123');
    expect(formatPhoneNumber('1234')).toBe('+7(123)4');
    expect(formatPhoneNumber('12345')).toBe('+7(123)45');
    expect(formatPhoneNumber('123456')).toBe('+7(123)456');
    expect(formatPhoneNumber('1234567')).toBe('+7(123)456-7');
    expect(formatPhoneNumber('12345678')).toBe('+7(123)456-78');
    expect(formatPhoneNumber('123456789')).toBe('+7(123)456-78-9');
  });
});
