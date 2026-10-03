import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS, FONT_FAMILY } from '../constants/theme';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import PricingScreen from '../screens/Profile/PricingScreen';
import ConfidentialiteScreen from '../screens/Profile/ConfidentialiteScreen';
import AideSupportScreen from '../screens/Profile/AideSupportScreen';
import NotificationScreen from '../screens/Notifications/NotificationScreen';

const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primaryDark },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontFamily: FONT_FAMILY },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Pricing" component={PricingScreen} options={{ title: 'Mon Abonnement' }} />
      <Stack.Screen name="Confidentialite" component={ConfidentialiteScreen} options={{ title: 'Confidentialité' }} />
      <Stack.Screen name="AideSupport" component={AideSupportScreen} options={{ title: 'Aide & Support' }} />
      <Stack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}
