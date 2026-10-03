export const PRODUCTION_API_ORIGIN = 'https://aanid-api.onrender.com';

function detectReactNative() {
  try {
    const { Platform } = require('react-native');
    return Platform.OS === 'android' || Platform.OS === 'ios';
  } catch {
    return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
  }
}

function fromEnv() {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.AANID_API_URL) return process.env.AANID_API_URL.replace(/\/$/, '');
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return null;
}

export function getApiOrigin() {
  const env = fromEnv();
  if (env) return env;

  if (detectReactNative()) {
    return PRODUCTION_API_ORIGIN;
  }

  if (typeof window !== 'undefined' && window.location) {
    return '';
  }

  return 'http://localhost:4000';
}

export function getApiBaseUrl() {
  const origin = getApiOrigin();
  if (!origin) return '/api/v1';
  return `${origin}/api/v1`;
}
