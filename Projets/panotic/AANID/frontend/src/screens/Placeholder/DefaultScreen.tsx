import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS } from '../../constants/theme';

export default function DefaultScreen({ title, icon = 'screwdriver-wrench' }: { title: string; icon?: string }) {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={54} color={COLORS.primaryDark} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>Module en cours de développement</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 20 },
  icon: { marginBottom: 16, opacity: 0.5 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: 14, color: COLORS.textTertiary, textAlign: 'center' },
});
