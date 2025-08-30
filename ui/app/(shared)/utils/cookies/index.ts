import { OptionsType } from 'cookies-next';

export const resolveCookiesOptions = (() => {
  const expiresPrevDay = new Date(Date.now() - 86400e3);
  const expires1Day = new Date(Date.now() + 86400e3);
  const expires7Day = new Date(Date.now() + 86400e3 * 7);

  return {
    expiresPrevDay,
    expires1Day,
    expires7Day,
    options: (options: OptionsType = {}): OptionsType => ({
      expires: expires1Day,
      ...options,
    }),
  };
})();
