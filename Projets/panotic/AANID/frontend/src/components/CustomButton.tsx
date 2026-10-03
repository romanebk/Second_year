import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONT_FAMILY } from '../constants/theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function CustomButton({ title, onPress, loading, disabled, variant = 'primary' }: Props) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={[styles.text, variant === 'outline' ? styles.outlineText : styles.primaryText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', width: '100%', marginVertical: 8 },
  primary: { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.backgroundAlt, borderWidth: 1, borderColor: COLORS.border },
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.primary },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: '700', fontFamily: FONT_FAMILY },
  primaryText: { color: COLORS.white },
  outlineText: { color: COLORS.primary },
});
