import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import * as authService from '../services/authService';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import { colors, spacing, radius, typography, shadows, PASSWORD_RE } from '../theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'CITOYEN', label: 'Citoyen' },
  { value: 'PROFESSIONNEL', label: 'Professionnel' },
  { value: 'REGIE', label: 'Régie publicitaire' },
  { value: 'FORMATEUR', label: 'Formateur' },
  { value: 'AUTORITE', label: 'Autorité publique' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 7-15 chiffres après suppression des séparateurs (espaces, tirets, parenthèses, +)
const PHONE_RE = /^\d{7,15}$/;

function normalizePhoneDigits(phone) {
  return phone.replace(/[\s\-\+\(\)]/g, '');
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateLoginForm({ email, password }) {
  if (!email.trim()) return "L'email est requis";
  if (!EMAIL_RE.test(email.trim())) return 'Adresse email invalide';
  if (!password) return 'Le mot de passe est requis';
  return null;
}

function validateRegisterForm({ fullName, email, phone, city, password, confirmPassword, acceptCgu }) {
  if (!fullName.trim() || fullName.trim().length < 2) return 'Le nom complet est requis (2 caractères minimum)';
  if (!email.trim()) return "L'email est requis";
  if (!EMAIL_RE.test(email.trim())) return 'Adresse email invalide';
  if (!phone.trim()) return 'Le numéro de téléphone est requis';
  if (!PHONE_RE.test(normalizePhoneDigits(phone))) return 'Numéro de téléphone invalide (7 à 15 chiffres)';
  if (!city.trim() || city.trim().length < 2) return 'La ville de résidence est requise';
  if (!PASSWORD_RE.test(password)) {
    return 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&-_#)';
  }
  if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas';
  if (!acceptCgu) return "Vous devez accepter les Conditions d'utilisation";
  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormInput({ label, error, secureEntry, toggleSecure, autoCapitalize = 'none', ...props }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          {...props}
        />
        {toggleSecure && (
          <TouchableOpacity onPress={toggleSecure} style={styles.eyeButton} hitSlop={8}>
            <Text style={styles.eyeText}>{secureEntry ? 'Voir' : 'Masquer'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

function Checkbox({ checked, onToggle, children }) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={() => onToggle(!checked)} activeOpacity={0.7}>
      <View style={[styles.checkBox, checked && styles.checkBoxChecked]}>
        {checked ? <Icon name="check" size={12} color={colors.white} /> : null}
      </View>
      <View style={styles.checkLabelContainer}>{children}</View>
    </TouchableOpacity>
  );
}

function RolePicker({ value, onChange }) {
  const [visible, setVisible] = useState(false);
  const selected = ROLES.find((r) => r.value === value) || ROLES[0];

  return (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Rôle</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.pickerText}>{selected.label}</Text>
          <Icon name="chevron-down" size={12} color={colors.placeholder} />
        </TouchableOpacity>
      </View>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Sélectionnez votre rôle</Text>
            <FlatList
              data={ROLES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerOption, item.value === value && styles.pickerOptionActive]}
                  onPress={() => { onChange(item.value); setVisible(false); }}
                >
                  <Text style={[styles.pickerOptionText, item.value === value && styles.pickerOptionTextActive]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Icon name="check" size={14} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function StatusBanner({ type, message, onAction, actionLabel }) {
  const bg = type === 'error' ? colors.red : type === 'success' ? colors.green : colors.primary;
  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <Text style={styles.bannerText}>{message}</Text>
      {onAction && (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={styles.bannerAction}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onSuccess, onSwitchToRegister, onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const handleLogin = useCallback(async () => {
    setError(null);
    const validationError = validateLoginForm({ email, password });
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const data = await authService.login({ email, password, rememberMe });
      onSuccess(data.user);
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true);
        setError("Votre email n'est pas encore vérifié.");
      } else {
        setError(err.message || 'Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, onSuccess]);

  const handleResend = useCallback(async () => {
    setResendLoading(true);
    try {
      await authService.resendVerification({ email });
      setResendDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  }, [email]);

  return (
    <View>
      {error && (
        <StatusBanner
          type="error"
          message={error}
          onAction={needsVerification && !resendDone ? handleResend : null}
          actionLabel={resendLoading ? '...' : "Renvoyer l'email"}
        />
      )}
      {resendDone && <StatusBanner type="success" message="Email de vérification renvoyé." />}

      <FormInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="vous@exemple.com"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="next"
      />

      <FormInput
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        placeholder="Votre mot de passe"
        secureEntry={!showPassword}
        toggleSecure={() => setShowPassword((v) => !v)}
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={handleLogin}
      />

      <View style={styles.loginFooterRow}>
        <Checkbox checked={rememberMe} onToggle={setRememberMe}>
          <Text style={styles.rememberLabel}>Se souvenir de moi</Text>
        </Checkbox>
        <TouchableOpacity onPress={onForgotPassword} hitSlop={8}>
          <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={styles.primaryButtonText}>Se connecter</Text>
        }
      </TouchableOpacity>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Pas encore de compte ? </Text>
        <TouchableOpacity onPress={onSwitchToRegister} hitSlop={8}>
          <Text style={styles.switchLink}>S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onRegistered, onSwitchToLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState('CITOYEN');
  const [acceptCgu, setAcceptCgu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = useCallback(async () => {
    setError(null);
    const validationError = validateRegisterForm({ fullName, email, phone, city, password, confirmPassword, acceptCgu });
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await authService.register({ fullName, email, phone, city, password, role });
      onRegistered(email);
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }, [fullName, email, phone, city, password, confirmPassword, role, acceptCgu, onRegistered]);

  return (
    <View>
      {error && <StatusBanner type="error" message={error} />}

      <FormInput
        label="Nom complet"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Prénom et Nom"
        textContentType="name"
        autoComplete="name"
        autoCapitalize="words"
        returnKeyType="next"
      />

      <FormInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="vous@exemple.com"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="next"
      />

      <FormInput
        label="Téléphone"
        value={phone}
        onChangeText={setPhone}
        placeholder="+229 XX XX XX XX"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        returnKeyType="next"
      />

      <FormInput
        label="Ville de résidence"
        value={city}
        onChangeText={setCity}
        placeholder="Ex : Cotonou, Abidjan…"
        textContentType="addressCity"
        autoCapitalize="words"
        returnKeyType="next"
      />

      <RolePicker value={role} onChange={setRole} />

      <FormInput
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        placeholder="Min. 8 car., maj., chiffre, symbole"
        secureEntry={!showPassword}
        toggleSecure={() => setShowPassword((v) => !v)}
        textContentType="newPassword"
        returnKeyType="next"
      />

      <PasswordStrengthBar password={password} style={{ marginTop: -spacing.xs, marginBottom: spacing.sm }} />

      <FormInput
        label="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Répétez le mot de passe"
        secureEntry={!showConfirm}
        toggleSecure={() => setShowConfirm((v) => !v)}
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleRegister}
      />

      <View style={styles.cguRow}>
        <Checkbox checked={acceptCgu} onToggle={setAcceptCgu}>
          <Text style={styles.cguText}>
            J'accepte les{' '}
            <Text
              style={styles.cguLink}
              onPress={() => Alert.alert('AANID', "Les Conditions d'utilisation seront disponibles prochainement.")}
            >
              Conditions d'utilisation
            </Text>
            {' '}et la{' '}
            <Text
              style={styles.cguLink}
              onPress={() => Alert.alert('AANID', 'La Politique de confidentialité sera disponible prochainement.')}
            >
              Politique de confidentialité
            </Text>
          </Text>
        </Checkbox>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={styles.primaryButtonText}>Créer mon compte</Text>
        }
      </TouchableOpacity>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Déjà inscrit ? </Text>
        <TouchableOpacity onPress={onSwitchToLogin} hitSlop={8}>
          <Text style={styles.switchLink}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Forgot Password Form ─────────────────────────────────────────────────────

function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!email.trim() || !EMAIL_RE.test(email.trim())) {
      setError('Adresse email invalide');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Erreur lors de la demande');
    } finally {
      setLoading(false);
    }
  }, [email]);

  if (done) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Email envoyé</Text>
        <Text style={styles.verificationBody}>
          Si un compte est associé à{'\n'}
          <Text style={styles.verificationEmail}>{email.trim().toLowerCase()}</Text>
          {'\n\n'}un lien de réinitialisation a été envoyé.{'\n'}
          Vérifiez votre boîte mail.
        </Text>
        <TouchableOpacity style={[styles.switchRow, { marginTop: spacing.lg }]} onPress={onBackToLogin} hitSlop={8}>
          <Text style={styles.switchLink}>← Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      {error && <StatusBanner type="error" message={error} />}

      <Text style={styles.forgotDescription}>
        Saisissez votre adresse email pour recevoir un lien de réinitialisation de mot de passe.
      </Text>

      <FormInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="vous@exemple.com"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={styles.primaryButtonText}>Envoyer le lien</Text>
        }
      </TouchableOpacity>

      <View style={styles.switchRow}>
        <TouchableOpacity onPress={onBackToLogin} hitSlop={8}>
          <Text style={styles.switchLink}>← Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Pending Verification ─────────────────────────────────────────────────────

function PendingVerification({ email, onBackToLogin }) {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const handleResend = useCallback(async () => {
    setResendLoading(true);
    try {
      await authService.resendVerification({ email });
      setResendDone(true);
    } catch {
      // silent fail — le serveur retourne toujours 200 pour cet endpoint
    } finally {
      setResendLoading(false);
    }
  }, [email]);

  return (
    <View style={styles.verificationContainer}>
      <View style={styles.verificationIconBox}>
        <Text style={styles.verificationIconText}>@</Text>
      </View>
      <Text style={styles.verificationTitle}>Vérifiez votre email</Text>
      <Text style={styles.verificationBody}>
        Un lien de confirmation a été envoyé à{'\n'}
        <Text style={styles.verificationEmail}>{email}</Text>
        {'\n\n'}Cliquez sur le lien pour activer votre compte.
      </Text>

      {resendDone ? (
        <Text style={styles.resendDoneText}>Email renvoyé.</Text>
      ) : (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleResend}
          disabled={resendLoading}
          activeOpacity={0.8}
        >
          {resendLoading
            ? <ActivityIndicator color={colors.primary} />
            : <Text style={styles.secondaryButtonText}>Renvoyer l'email</Text>
          }
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.switchRow, { marginTop: spacing.md }]} onPress={onBackToLogin} hitSlop={8}>
        <Text style={styles.switchLink}>← Retour à la connexion</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Auth Screen ─────────────────────────────────────────────────────────

const HEADER_SUBTITLES = {
  login: 'Connectez-vous à votre compte',
  register: 'Créez votre compte',
  pending: 'Activation du compte',
  forgot: 'Réinitialisation du mot de passe',
};

/**
 * @param {{ onAuthenticated: (user: object) => void }} props
 */
export default function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'pending' | 'forgot'
  const [pendingEmail, setPendingEmail] = useState('');

  const handleRegistered = useCallback((email) => {
    setPendingEmail(email);
    setMode('pending');
  }, []);

  const showTabs = mode === 'login' || mode === 'register';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logoText}>AANID</Text>
            <Text style={styles.headerSubtitle}>{HEADER_SUBTITLES[mode]}</Text>
          </View>

          {/* Tab toggle */}
          {showTabs && (
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, mode === 'login' && styles.tabActive]}
                onPress={() => setMode('login')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Connexion</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === 'register' && styles.tabActive]}
                onPress={() => setMode('register')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Inscription</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Form card */}
          <View style={styles.card}>
            {mode === 'login' && (
              <LoginForm
                onSuccess={onAuthenticated}
                onSwitchToRegister={() => setMode('register')}
                onForgotPassword={() => setMode('forgot')}
              />
            )}
            {mode === 'register' && (
              <RegisterForm
                onRegistered={handleRegistered}
                onSwitchToLogin={() => setMode('login')}
              />
            )}
            {mode === 'pending' && (
              <PendingVerification
                email={pendingEmail}
                onBackToLogin={() => setMode('login')}
              />
            )}
            {mode === 'forgot' && (
              <ForgotPasswordForm
                onBackToLogin={() => setMode('login')}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xl },

  header: {
    alignItems: 'center',
    paddingTop: spacing.xl + spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
    fontFamily: 'CenturyGothic',
  },
  headerSubtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.button,
    padding: 4,
    ...shadows.card,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.button - 2,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.label, color: colors.textSecondary },
  tabTextActive: { color: colors.white, fontWeight: '700' },

  card: {
    margin: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.md,
    ...shadows.card,
  },

  inputGroup: { marginBottom: spacing.md },
  inputLabel: { ...typography.label, marginBottom: spacing.xs },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    height: 44,
    paddingHorizontal: spacing.sm,
  },
  inputError: { borderColor: colors.red },
  input: { flex: 1, ...typography.body, color: colors.textPrimary },
  eyeButton: { paddingHorizontal: spacing.xs },
  eyeText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  fieldError: { ...typography.caption, color: colors.red, marginTop: 4 },

  // Checkbox
  checkRow: { flexDirection: 'row', alignItems: 'center' },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  checkBoxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkMark: { color: colors.white, fontSize: 12, fontWeight: '700', lineHeight: 14 },
  checkLabelContainer: { flex: 1 },

  // "Se souvenir de moi" + "Mot de passe oublié ?"
  loginFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rememberLabel: { ...typography.caption },
  forgotText: { ...typography.caption, color: colors.primary },

  // CGU checkbox
  cguRow: { marginBottom: spacing.md },
  cguText: { ...typography.caption, lineHeight: 18 },
  cguLink: { color: colors.primary, fontWeight: '600' },

  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    height: 44,
    paddingHorizontal: spacing.sm,
  },
  pickerText: { ...typography.body, color: colors.textPrimary },
  pickerChevron: { color: colors.textSecondary, fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  pickerModal: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    overflow: 'hidden',
    ...shadows.card,
  },
  pickerModalTitle: {
    ...typography.label,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerOptionActive: { backgroundColor: colors.primary + '14' },
  pickerOptionText: { ...typography.body },
  pickerOptionTextActive: { color: colors.primary, fontWeight: '600' },
  pickerCheck: { color: colors.primary, fontWeight: '700', fontSize: 16 },

  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.button,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: colors.white, fontWeight: '700', fontSize: 15 },

  secondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.button,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: { color: colors.primary, fontWeight: '600', fontSize: 15 },

  forgotDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },

  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  switchText: { ...typography.caption },
  switchLink: { ...typography.caption, color: colors.primary, fontWeight: '700' },

  banner: {
    borderRadius: radius.button,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: { color: colors.white, fontSize: 13, flex: 1, flexWrap: 'wrap' },
  bannerAction: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: spacing.sm,
    textDecorationLine: 'underline',
  },

  verificationContainer: { alignItems: 'center', paddingVertical: spacing.lg },
  verificationIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  verificationIconText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'CenturyGothic',
  },
  verificationTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  verificationBody: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
  },
  verificationEmail: { color: colors.primary, fontWeight: '700' },
  resendDoneText: { ...typography.body, color: colors.green, fontWeight: '600', marginTop: spacing.md },
});
