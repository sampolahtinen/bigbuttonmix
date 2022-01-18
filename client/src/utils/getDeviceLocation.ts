import { getMapboxLocation } from '../api/getMapboxLocation';

export type DeviceLocation = {
  countryCode: string;
  city: string;
  message?: string;
};

export const getDeviceLocation = () => {
  return new Promise<DeviceLocation>((resolve, reject) => {
    if (navigator && navigator.geolocation) {
      const onGranted: PositionCallback = async ({ coords }) => {
        const { latitude, longitude } = coords;

        try {
          const response = await getMapboxLocation(latitude, longitude);

          /**
           * Parsing of response to get the short code for the country and a city name
           */
          const deviceLocation = response.data.features.reduce<{
            countryCode: string;
            city: string;
          }>(
            (acc, currentValue) => {
              if (currentValue.id.includes('place')) {
                const city = currentValue.place_name
                  .split(',')[0]
                  .toLowerCase();
                return { ...acc, city };
              }

              if (currentValue.id.includes('country')) {
                const countryCode = currentValue.properties.short_code ?? '';
                return { ...acc, countryCode };
              }

              return acc;
            },
            { countryCode: '', city: '' }
          );

          resolve(deviceLocation);
        } catch (error) {
          reject(new Error('Mapbox request failed.'));
        }
      };

      const onDenied = () => reject(new Error('no permission.'));

      navigator.geolocation.getCurrentPosition(onGranted, onDenied);
    } else {
      reject(new Error('geolocation not available.'));
    }
  });
};
