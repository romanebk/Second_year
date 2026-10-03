// Application Configuration

// Set to true to use Supabase, false to use mock data
// Important: Configure Supabase first (see /SUPABASE_SETUP.md) before enabling
export const USE_SUPABASE = false;

// Feature flags
export const FEATURES = {
  faceRecognition: true,
  geolocation: true,
  realTimeMonitoring: true,
  aiAlerts: true,
};

// App constants
export const APP_CONFIG = {
  verificationFrequency: 90, // minutes
  defaultSiteRadius: 100, // meters
  aiConfidenceThreshold: 70, // percentage
  maxCheckInsPerDay: 20,
};