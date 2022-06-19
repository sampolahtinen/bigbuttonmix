export const PORT = process.env.PORT || 4000;

export const RETRY_LIMIT = 5;

export const REDIS_ENABLED = process.env.REDIS_ENABLED;

export const __DEV__ = process.env.NODE_ENV === 'development';
