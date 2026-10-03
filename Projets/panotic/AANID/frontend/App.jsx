import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0A1628" />
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
