import { useState } from 'react';
import { getDeviceLocation, DeviceLocation } from '../utils/getDeviceLocation';

export const useDeviceLocation = () => {
  const [deviceLocation, setDeviceLocation] = useState<
    DeviceLocation | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getLocation = async () => {
    setIsLoading(true);
    try {
      const location = await getDeviceLocation();

      localStorage.setItem('device-location', JSON.stringify(location));

      setDeviceLocation(location);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      setIsLoading(false);
    }
  };

  return { deviceLocation, getLocation, isLoading, error };
};
