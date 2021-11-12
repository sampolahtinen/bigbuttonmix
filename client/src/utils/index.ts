import { format } from 'date-fns';

export const isStandalonePWARequest = () => {
  const isPWAiOS =
    //@ts-ignore
    'standalone' in window.navigator && window.navigator['standalone'];
  const isPWAChrome = window.matchMedia('(display-mode: standalone)').matches;

  return isPWAiOS || isPWAChrome;
};

export const getCurrentDate = () => format(new Date(), 'yyyy-MM-dd');
