// Thème "Sable" — source de vérité unique pour toute l'application AANID.
// Couleur principale : beige/sable (#C19A6B), fond crème (#F9F1E5).
export const COLORS = {
  primary: '#C19A6B',
  primaryLight: '#D9C2A0',
  primaryDark: '#9C7C4F',
  secondary: '#8C6A43',
  secondaryLight: '#B08C5E',
  secondaryDark: '#6E5333',
  accent: '#C19A6B',

  success: '#6E8B5B',
  successLight: '#88A574',
  warning: '#D9A441',
  error: '#C75D4F',
  errorLight: '#D77A6E',
  info: '#9C7C4F',

  background: '#F9F1E5',
  backgroundAlt: '#F2E7D3',
  surface: '#FFFFFF',
  white: '#FFFFFF',

  text: '#2E2A24',
  textSecondary: '#7A7166',
  textTertiary: '#A89E90',
  textMuted: '#CFC4B2',

  inputBorder: '#E8DCC8',
  inputFocus: '#C19A6B',
  placeholder: '#A89E90',
  overlay: 'rgba(46, 42, 36, 0.45)',
  border: '#E8DCC8',
  cardBg: 'rgba(255, 255, 255, 0.96)',
  chipBg: 'rgba(193, 154, 107, 0.14)',
  shadow: '#2E2A24',

  tabInactive: '#A89E90',
  tabActive: '#9C7C4F',
  tabBg: '#FFFFFF',
  headerBg: '#F9F1E5',
};

// Police de marque (enregistrée via @font-face dans index.web.js)
export const FONT_FAMILY = 'CenturyGothic';
export const FONTS = {
  regular: FONT_FAMILY,
  medium: FONT_FAMILY,
  bold: FONT_FAMILY,
};

export const SIZES = {
  radius: 16,
  radiusLg: 24,
  padding: 20,
  font: 15,
};

export const SHADOWS = {
  sm: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  md: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  lg: { shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 10 },
};

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34, fontFamily: FONT_FAMILY },
  h2: { fontSize: 24, fontWeight: '800' as const, lineHeight: 30, fontFamily: FONT_FAMILY },
  h3: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26, fontFamily: FONT_FAMILY },
  h4: { fontSize: 17, fontWeight: '700' as const, lineHeight: 22, fontFamily: FONT_FAMILY },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22, fontFamily: FONT_FAMILY },
};
