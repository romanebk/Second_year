import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

function getStrength(password) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[@$!%*?&\-_#]/.test(password)) score++;
  if (score <= 1) return { label: 'Faible', color: colors.red, width: '25%' };
  if (score === 2) return { label: 'Moyen', color: colors.orange, width: '50%' };
  if (score === 3) return { label: 'Bon', color: colors.primary, width: '75%' };
  return { label: 'Fort', color: colors.green, width: '100%' };
}

export default function PasswordStrengthBar({ password, style }) {
  const strength = getStrength(password);
  if (!strength) return null;
  return (
    <View style={[styles.container, style]}>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: strength.width, backgroundColor: strength.color }]} />
      </View>
      <Text style={[styles.label, { color: strength.color }]}>{strength.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  bar: { flex: 1, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  label: { ...typography.caption, marginLeft: spacing.xs, width: 48, fontWeight: '600' },
});
