module.exports = {
  project: {
    android: {
      packageName: 'com.aanid',
    },
    ios: {},
  },
  assets: ['./assets/fonts/'],
  dependencies: {
    // Carte native = Leaflet (WebView), pas Google Maps SDK
    'react-native-maps': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
