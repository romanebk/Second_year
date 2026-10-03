import React from 'react';
import { Text } from 'react-native';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// Remplace react-native-vector-icons sur le web (Vite) : rend les vraies
// icônes FontAwesome en SVG inline au lieu de polices TTF non chargées.

type Props = {
  name: string;
  size?: number;
  color?: string;
  solid?: boolean;
  brand?: boolean;
  style?: any;
};

function toFaKey(name: string): string {
  return 'fa' + name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function findIcon(name: string, brand?: boolean) {
  const key = toFaKey(name);
  if (brand) return (fab as any)[key] || (fas as any)[key];
  return (fas as any)[key] || (fab as any)[key];
}

export default function Icon({ name, size = 24, color = '#000', brand, style }: Props) {
  const def = findIcon(name, brand);
  if (!def) {
    return <Text style={{ fontSize: size, color, textAlign: 'center' }}>•</Text>;
  }

  const [width, height, , , pathData] = def.icon;
  const d = Array.isArray(pathData) ? pathData.join(' ') : pathData;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} fill={color} />
    </svg>
  );
}
