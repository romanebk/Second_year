import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS, FONT_FAMILY } from '../constants/theme';

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  icon?: string;
}

export default function CustomInput({ placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, icon }: Props) {
  const [show, setShow] = React.useState(false);

  return (
    <View style={styles.container}>
      {icon && <Icon name={icon} size={17} color={COLORS.primaryDark} solid style={styles.icon} />}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textTertiary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !show}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {secureTextEntry && (
        <TouchableOpacity
          onPress={() => setShow(!show)}
          style={styles.toggle}
          accessibilityRole="button"
          accessibilityLabel={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          <Icon name={show ? 'eye-slash' : 'eye'} size={17} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.text, outlineStyle: 'none', outlineWidth: 0, fontFamily: FONT_FAMILY },
  toggle: { width: 44, height: 44, marginRight: -12, justifyContent: 'center', alignItems: 'center' },
});
