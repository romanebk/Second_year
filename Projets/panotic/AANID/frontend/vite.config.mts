import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: [
      { find: 'react-native', replacement: path.resolve(__dirname, 'src/mocks/react-native-web-bridge.js') },
      { find: 'react-native-maps', replacement: path.resolve(__dirname, 'src/mocks/maps-mock.tsx') },
      { find: /^react-native-map-clustering(\/.*)?$/, replacement: path.resolve(__dirname, 'src/mocks/maps-mock.tsx') },
      { find: /^react-native-vector-icons\/.*/, replacement: path.resolve(__dirname, 'src/mocks/vector-icons-mock.tsx') },
      { find: 'react-native-vector-icons', replacement: path.resolve(__dirname, 'src/mocks/vector-icons-mock.tsx') },
      { find: 'react-native-webview', replacement: path.resolve(__dirname, 'src/mocks/webview-mock.tsx') },
      { find: 'react-native-safe-area-context', replacement: path.resolve(__dirname, 'src/mocks/base-mock.tsx') },
      { find: 'react-native-screens', replacement: path.resolve(__dirname, 'src/mocks/screens-mock.tsx') },
    ],
    extensions: [
      '.web.tsx', '.web.ts', '.web.jsx', '.web.js',
      '.tsx', '.ts', '.jsx', '.js',
    ],
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(true),
    'process.env.AANID_API_URL': JSON.stringify(process.env.AANID_API_URL || ''),
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
    exclude: [
      'react-native-vector-icons',
      'react-native-safe-area-context',
      'react-native-screens',
      'react-native-maps',
      'react-native-map-clustering',
      '@aanid/beni-momo-adnan-frontend',
      '@aanid/bryan-fanou-frontend',
      '@aanid/rayan-frontend',
      '@aanid/undef-frontend',
      '@aanid/w-d-frontend',
    ],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
