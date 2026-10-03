import * as RNWeb from 'react-native-web';

export const PermissionsAndroid = {
  request: async () => 'granted',
  check: async () => true,
  requestMultiple: async () => ({}),
  RESULTS: { GRANTED: 'granted', DENIED: 'denied', NEVER_ASK_AGAIN: 'never_ask_again' },
  PERMISSIONS: { ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION' },
};

export * from 'react-native-web';

const ExportedRN = { ...RNWeb, PermissionsAndroid };
export default ExportedRN;
