export const PORT = process.env.PORT || 5000;

export const RETRY_LIMIT = 5;

export const REDIS_ENABLED = false;

export enum ErrorMessages {
  NoEvents = 'No events found.'
}

export const __DEV__ = process.env.NODE_ENV === 'development';
