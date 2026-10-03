const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');
const mapsStub = path.resolve(projectRoot, 'src/mocks/maps-native-stub.tsx');
const fontAwesomeNative = path.resolve(projectRoot, 'src/native/FontAwesomeIcon.tsx');
const fa6AutoIcon = path.resolve(projectRoot, 'src/native/FA6AutoIcon.tsx');

const defaultConfig = getDefaultConfig(projectRoot);

function isMapsModule(name) {
  return name === 'react-native-maps'
    || name.startsWith('react-native-maps/')
    || name === 'react-native-map-clustering'
    || name.startsWith('react-native-map-clustering/');
}

const config = {
  watchFolders: [
    monorepoRoot,
    path.resolve(monorepoRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'shared'),
    path.resolve(monorepoRoot, 'rayann/frontend'),
    path.resolve(monorepoRoot, 'beni-momo-adnan/frontend'),
    path.resolve(monorepoRoot, 'bryan-fanou/frontend'),
    path.resolve(monorepoRoot, 'w-d/frontend'),
    path.resolve(monorepoRoot, 'undef/frontend'),
  ],
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (platform !== 'web') {
        if (isMapsModule(moduleName)) {
          return { filePath: mapsStub, type: 'sourceFile' };
        }
        if (moduleName === '@fortawesome/react-fontawesome') {
          return { filePath: fontAwesomeNative, type: 'sourceFile' };
        }
        // Style FA6 auto-détecté (solid/regular/brand) selon le glyphe demandé
        if (moduleName === 'react-native-vector-icons/FontAwesome6') {
          return { filePath: fa6AutoIcon, type: 'sourceFile' };
        }
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
