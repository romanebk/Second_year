import { Platform } from 'react-native';

/** Backend déployé sur Render */
export const PRODUCTION_API_ORIGIN = 'https://aanid-api.onrender.com';

function resolveOrigin(): string {
  const env =
    (typeof process !== 'undefined' && process.env?.AANID_API_URL) ||
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL);

  if (env) return env.replace(/\/$/, '');

  // Web dev : proxy Vite → localhost:4000
  if (Platform.OS === 'web') {
    return __DEV__ ? '' : PRODUCTION_API_ORIGIN;
  }

  // Android / iOS : API Render (APK utilisable sur appareil réel)
  return PRODUCTION_API_ORIGIN;
}

export const API_ORIGIN = resolveOrigin();
export const API_BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api/v1` : '/api/v1';
