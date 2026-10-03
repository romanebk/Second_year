import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS, FONT_FAMILY } from '../constants/theme';

export default function TopNavbar() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.sideBtn} activeOpacity={0.7}>
        <Icon name="user" size={17} color={COLORS.primaryDark} solid />
      </TouchableOpacity>

      <Text style={styles.logoText}>aanid</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.sideBtn} activeOpacity={0.7}>
        <Icon name="bell" size={17} color={COLORS.primaryDark} solid />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 18,
  },
  sideBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 30,
    fontStyle: 'italic',
    fontWeight: '700',
    fontFamily: FONT_FAMILY,
    color: COLORS.primaryDark,
  },
});
