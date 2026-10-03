// AANID Brand — charte graphique 2024

export const colors = {
  // Primaires
  primary: '#1E73BE',       // Bleu AANID — Hub Villes & Profils
  primaryDark: '#155a94',   // Hover / pressed
  green: '#3BB273',         // Formations & Succès
  orange: '#F5A623',        // Relais & Flux
  red: '#E94E3C',           // États & Signalements

  // Neutres
  textPrimary: '#212121',   // Titres et textes principaux
  textSecondary: '#6B6B6B', // Textes secondaires
  placeholder: '#BDBDBD',   // Placeholder et séparateurs
  surface: '#F5F5F5',       // Fonds de cartes
  white: '#FFFFFF',
  background: '#FFFFFF',

  // Abonnements
  subscription: {
    FREE: '#BDBDBD',
    PREMIUM: '#1E73BE',
    PROFESSIONAL: '#F5A623',
    ENTERPRISE: '#212121',
  },

  // Rôles
  role: {
    CITOYEN: '#1E73BE',
    PROFESSIONNEL: '#3BB273',
    REGIE: '#F5A623',
    FORMATEUR: '#3BB273',
    AUTORITE: '#E94E3C',
    ADMIN: '#212121',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  button: 8,
  card: 12,
  input: 8,
  badge: 20,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700', fontFamily: 'CenturyGothic', color: colors.textPrimary },
  h2: { fontSize: 28, fontWeight: '700', fontFamily: 'CenturyGothic', color: colors.textPrimary },
  h3: { fontSize: 22, fontWeight: '700', fontFamily: 'CenturyGothic', color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', fontFamily: 'CenturyGothic', color: colors.textPrimary },
  caption: { fontSize: 13, fontWeight: '400', fontFamily: 'CenturyGothic', color: colors.textSecondary },
  label: { fontSize: 14, fontWeight: '600', fontFamily: 'CenturyGothic', color: colors.textPrimary },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
};

// Shared password validation — min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char (@$!%*?&-_#), max 128
export const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#])[A-Za-z\d@$!%*?&\-_#]{8,128}$/;
