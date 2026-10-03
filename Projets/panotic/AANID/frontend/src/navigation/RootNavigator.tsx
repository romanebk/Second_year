import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setCredentials,
  restoreFinished,
  selectIsAuthenticated,
  selectAuthRestoring,
} from '../store/slices/authSlice';
import { api } from '../api/client';
import { COLORS, FONT_FAMILY } from '../constants/theme';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import ProfileNavigator from './ProfileNavigator';
import NotificationScreen from '../screens/Notifications/NotificationScreen';
import RelaisPublicitaire from '@aanid/beni-momo-adnan-frontend/src/screens/RelaisPublicitaire';

const ACCESS_TOKEN_KEY = '@aanid/v1/access_token';
const REFRESH_TOKEN_KEY = '@aanid/v1/refresh_token';
const VILLE_ID_KEY = '@aanid/v1/ville_id';
const VILLE_NOM_KEY = '@aanid/v1/ville_nom';

const Stack = createNativeStackNavigator();

// Les liens des emails (réinitialisation, vérification) ouvrent le bon écran :
// web → /reset-password?token=… ; natif → aanid://reset-password?token=…
const linking = {
  prefixes: ['aanid://'],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password',
      VerifyEmail: 'verify-email',
    },
  },
};

async function fetchProfile(token: string) {
  const { data } = await api.get('/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.user;
}

function useSessionRestore() {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        let token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!token && !refreshToken) return;

        let user = null;
        if (token) {
          try {
            user = await fetchProfile(token);
          } catch {
            token = null;
          }
        }

        if (!user && refreshToken) {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          token = data.accessToken;
          await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
          if (data.refreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
          }
          user = await fetchProfile(data.accessToken);
        }

        if (user && token) {
          const villeId = (await AsyncStorage.getItem(VILLE_ID_KEY)) || undefined;
          const villeNom = (await AsyncStorage.getItem(VILLE_NOM_KEY)) || undefined;
          dispatch(setCredentials({
            user: {
              id: user.id,
              email: user.email,
              firstName: user.fullName?.split(' ')[0] || 'Citoyen',
              fullName: user.fullName,
              role: user.role,
              villeId,
              villeNom,
            },
            token,
          }));
        }
      } catch {
        await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]).catch(() => {});
      } finally {
        dispatch(restoreFinished());
      }
    })();
  }, [dispatch]);
}

function SplashScreen() {
  return (
    <View style={splashStyles.container}>
      <Text style={splashStyles.brand}>aanid</Text>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, gap: 20 },
  brand: { fontSize: 42, fontStyle: 'italic', fontWeight: '700', color: COLORS.primaryDark, fontFamily: FONT_FAMILY },
});

function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primaryDark },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontFamily: FONT_FAMILY },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="Publicite" component={RelaisPublicitaire} options={{ title: 'Relais Publicitaire' }} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  useSessionRestore();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const restoring = useSelector(selectAuthRestoring);

  if (restoring) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
