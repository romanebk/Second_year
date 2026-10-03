import React, { memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS, FONT_FAMILY } from '../constants/theme';
import FormationNavigator from './FormationNavigator';
import TopNavbar from '../components/TopNavbar';

import Villes from '@aanid/beni-momo-adnan-frontend/src/screens/Villes';
import SocialScreen from '../screens/Social/SocialScreen';
import EtatsDesLieux from '@aanid/bryan-fanou-frontend/src/screens/EtatsDesLieux';
import CarteInteractive from '@aanid/rayan-frontend/src/screens/CarteInteractive';

const Tab = createBottomTabNavigator();

const TAB_CONFIG: Record<string, { icon: string; label: string }> = {
  Dashboard: { icon: 'house', label: 'Accueil' },
  Carte: { icon: 'map-location-dot', label: 'Carte' },
  EtatsDesLieux: { icon: 'clipboard-list', label: 'États des Lieux' },
  Formation: { icon: 'building-columns', label: 'Formation' },
  Social: { icon: 'comment', label: 'Social' },
};

const TabIcon = memo(function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const config = TAB_CONFIG[routeName] || { icon: 'house', label: '' };
  const color = focused ? COLORS.tabActive : COLORS.tabInactive;
  return (
    <View style={[tabStyles.iconBg, focused && tabStyles.iconBgActive]}>
      <Icon name={config.icon} size={19} color={color} solid />
    </View>
  );
});

const tabStyles = StyleSheet.create({
  iconBg: {
    paddingHorizontal: 16,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBgActive: { backgroundColor: COLORS.chipBg },
});

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
        tabBarLabel: TAB_CONFIG[route.name]?.label ?? '',
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarLabelStyle: { fontSize: 9.5, fontFamily: FONT_FAMILY, fontWeight: '600', marginTop: 2 },
        tabBarItemStyle: { flex: 1, paddingTop: 2 },
        header: () => <TopNavbar />,
        lazy: true,
        freezeOnBlur: true,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.tabBg,
          height: Platform.OS === 'ios' ? 84 : 70,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Villes} />
      <Tab.Screen name="Carte" component={CarteInteractive} />
      <Tab.Screen name="EtatsDesLieux" component={EtatsDesLieux} />
      <Tab.Screen name="Formation" component={FormationNavigator} />
      <Tab.Screen name="Social" component={SocialScreen} />
    </Tab.Navigator>
  );
}
