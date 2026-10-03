import React from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import FA6Icon from 'react-native-vector-icons/FontAwesome6';

type Props = {
  icon: IconProp;
  size?: number;
  color?: string;
  style?: { fontSize?: number; color?: string };
};

function styleFlags(prefix: string | undefined) {
  if (prefix === 'fab') return { brand: true as const };
  if (prefix === 'far') return { regular: true as const };
  return { solid: true as const };
}

function resolveIconName(icon: IconProp): string | null {
  if (!icon || typeof icon !== 'object') return null;
  if ('iconName' in icon && icon.iconName) return String(icon.iconName);
  return null;
}

/** Remplacement natif de @fortawesome/react-fontawesome (web/DOM uniquement). */
export function FontAwesomeIcon({ icon, size, color, style }: Props) {
  const resolvedSize = size ?? style?.fontSize ?? 16;
  const resolvedColor = color ?? style?.color ?? '#2E2A24';
  const iconName = resolveIconName(icon);
  const prefix = icon && typeof icon === 'object' && 'prefix' in icon ? String(icon.prefix) : 'fas';

  if (!iconName) {
    return <Text style={{ fontSize: resolvedSize, color: resolvedColor }}>•</Text>;
  }

  return (
    <FA6Icon
      name={iconName}
      size={resolvedSize}
      color={resolvedColor}
      style={style as StyleProp<TextStyle>}
      {...styleFlags(prefix)}
    />
  );
}

export default FontAwesomeIcon;
