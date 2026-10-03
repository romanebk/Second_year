import { useState, useEffect, useCallback } from 'react';
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
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import * as authService from '../services/authService';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import { colors, spacing, radius, typography, shadows, PASSWORD_RE } from '../theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS = {
  CITOYEN: 'Citoyen',
  PROFESSIONNEL: 'Professionnel',
  REGIE: 'Régie',
  FORMATEUR: 'Formateur',
  AUTORITE: 'Autorité',
  ADMIN: 'Administrateur',
};

const SUBSCRIPTION_LABELS = {
  FREE: 'Gratuit',
  PREMIUM: 'Premium',
  PROFESSIONAL: 'Professionnel',
  ENTERPRISE: 'Entreprise',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(fullName = '') {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ fullName, size = 72 }) {
  const initials = getInitials(fullName);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

function RoleBadge({ role }) {
  const color = colors.role[role] || colors.primary;
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{ROLE_LABELS[role] || role}</Text>
    </View>
  );
}

function SubscriptionBadge({ subscription }) {
  const color = colors.subscription[subscription] || colors.placeholder;
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{SUBSCRIPTION_LABELS[subscription] || subscription}</Text>
    </View>
  );
}

function SectionCard({ title, children }) {
  return (
    <View style={styles.card}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {children}
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

function FeatureItem({ label }) {
  return (
    <View style={styles.featureRow}>
      <Icon name="check" size={14} color={colors.green} />
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

function PasswordInput({ label, value, onChangeText, show, onToggle, placeholder, ...props }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
        {onToggle && (
          <TouchableOpacity onPress={onToggle} hitSlop={8} style={styles.eyeButton}>
            <Text style={styles.eyeText}>{show ? 'Masquer' : 'Voir'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

const PHONE_DIGITS_RE = /^\d{7,15}$/;

function normalizePhoneDigits(phone) {
  return phone.replace(/[\s\-\+\(\)]/g, '');
}

function EditProfileModal({ visible, user, onClose, onSaved }) {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      setFullName(user?.fullName || '');
      setPhone(user?.phone || '');
      setCity(user?.city || '');
      setError(null);
    }
  }, [visible, user]);

  const handleSave = useCallback(async () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return;
    }
    if (phone.trim() && !PHONE_DIGITS_RE.test(normalizePhoneDigits(phone))) {
      setError('Numéro de téléphone invalide (7 à 15 chiffres)');
      return;
    }
    if (city.trim() && city.trim().length < 2) {
      setError('La ville doit contenir au moins 2 caractères');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await authService.updateProfile({ fullName, phone: phone.trim() || undefined, city: city.trim() || undefined });
      onSaved(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  }, [fullName, phone, city, onSaved, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Modifier le profil</Text>

          {error && (
            <View style={[styles.banner, { backgroundColor: colors.red }]}>
              <Text style={styles.bannerText}>{error}</Text>
            </View>
          )}

          <Text style={styles.inputLabel}>Nom complet</Text>
          <View style={[styles.inputWrapper, { marginBottom: spacing.sm }]}>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Prénom et Nom"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <Text style={styles.inputLabel}>Téléphone</Text>
          <View style={[styles.inputWrapper, { marginBottom: spacing.sm }]}>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+229 XX XX XX XX"
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <Text style={styles.inputLabel}>Ville de résidence</Text>
          <View style={[styles.inputWrapper, { marginBottom: spacing.md }]}>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Ex : Cotonou, Abidjan…"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, { flex: 1 }, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.primaryButtonText}>Enregistrer</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────

function ChangePasswordModal({ visible, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setShowCurrent(false); setShowNew(false); setShowConfirm(false);
      setError(null); setSuccess(false);
    }
  }, [visible]);

  const handleChange = useCallback(async () => {
    setError(null);
    if (!currentPassword) { setError('Mot de passe actuel requis'); return; }
    if (!PASSWORD_RE.test(newPassword)) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial');
      return;
    }
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }

    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Changer le mot de passe</Text>

          {success ? (
            <View style={styles.successBox}>
              <View style={styles.successIconBox}>
                <Icon name="check" size={22} color={colors.white} />
              </View>
              <Text style={styles.successText}>Mot de passe modifié avec succès.</Text>
              <Text style={styles.successHint}>Vos autres sessions ont été déconnectées.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={onClose} activeOpacity={0.85}>
                <Text style={styles.primaryButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {error && (
                <View style={[styles.banner, { backgroundColor: colors.red }]}>
                  <Text style={styles.bannerText}>{error}</Text>
                </View>
              )}

              <PasswordInput
                label="Mot de passe actuel"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="••••••••"
                show={showCurrent}
                onToggle={() => setShowCurrent((v) => !v)}
                textContentType="password"
                returnKeyType="next"
              />

              <PasswordInput
                label="Nouveau mot de passe"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Min. 8 car., maj., chiffre, symbole"
                show={showNew}
                onToggle={() => setShowNew((v) => !v)}
                textContentType="newPassword"
                returnKeyType="next"
              />

              <PasswordStrengthBar password={newPassword} style={{ marginVertical: spacing.xs }} />

              <PasswordInput
                label="Confirmer le nouveau mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Répétez le nouveau mot de passe"
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={handleChange}
              />

              <View style={[styles.modalButtons, { marginTop: spacing.md }]}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.8}>
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1 }, loading && styles.buttonDisabled]}
                  onPress={handleChange}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading
                    ? <ActivityIndicator color={colors.white} />
                    : <Text style={styles.primaryButtonText}>Confirmer</Text>
                  }
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Profile Screen ──────────────────────────────────────────────────────

/**
 * @param {{ onLogout: () => void }} props
 */
export default function Profil({ onLogout }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, subData] = await Promise.all([
        authService.getProfile(),
        authService.getSubscription(),
      ]);
      setUser(profileData.user);
      setSubscription(subData);
    } catch (err) {
      setError(err.message || 'Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            setLogoutLoading(true);
            try {
              await onLogout?.();
            } finally {
              setLogoutLoading(false);
            }
          },
        },
      ]
    );
  }, [onLogout]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.infoLabel, { marginTop: spacing.sm }]}>Chargement du profil...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={[styles.infoValue, { color: colors.red, textAlign: 'center' }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.primaryButton, { marginTop: spacing.md, paddingHorizontal: spacing.lg }]}
          onPress={loadProfile}
        >
          <Text style={styles.primaryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.profileHeader}>
          <Avatar fullName={user?.fullName} size={80} />
          <Text style={styles.profileName}>{user?.fullName}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            <RoleBadge role={user?.role} />
            <SubscriptionBadge subscription={user?.subscription} />
          </View>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => setShowEditModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.editProfileButtonText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Informations personnelles */}
        <SectionCard title="Informations personnelles">
          <InfoRow label="Nom complet" value={user?.fullName} />
          <View style={styles.separator} />
          <InfoRow label="Email" value={user?.email} />
          <View style={styles.separator} />
          <InfoRow label="Téléphone" value={user?.phone || '—'} />
          <View style={styles.separator} />
          <InfoRow label="Ville" value={user?.city || '—'} />
          <View style={styles.separator} />
          <InfoRow label="Membre depuis" value={formatDate(user?.createdAt)} />
          <View style={styles.separator} />
          <InfoRow
            label="Statut email"
            value={user?.emailVerified ? 'Vérifié' : 'Non vérifié'}
          />
        </SectionCard>

        {/* Abonnement */}
        {subscription && (
          <SectionCard title={`Abonnement — ${subscription.details?.label}`}>
            <View style={[styles.subscriptionBanner, { borderLeftColor: subscription.details?.color || colors.primary }]}>
              <Text style={styles.subscriptionPlanName}>{subscription.details?.label}</Text>
              {subscription.details?.features?.map((f) => (
                <FeatureItem key={f} label={f} />
              ))}
            </View>
            {user?.subscription === 'FREE' && (
              <TouchableOpacity style={styles.upgradeButton} activeOpacity={0.8} onPress={() => {}}>
                <Text style={styles.upgradeButtonText}>Passer à Premium</Text>
              </TouchableOpacity>
            )}
          </SectionCard>
        )}

        {/* Securite */}
        <SectionCard title="Sécurité">
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setShowPasswordModal(true)}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.actionLabel}>Changer le mot de passe</Text>
              <Text style={styles.actionHint}>Dernière modification : {formatDate(user?.updatedAt)}</Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        </SectionCard>

        {/* Deconnexion */}
        <TouchableOpacity
          style={[styles.logoutButton, logoutLoading && styles.buttonDisabled]}
          onPress={handleLogout}
          disabled={logoutLoading}
          activeOpacity={0.8}
        >
          {logoutLoading
            ? <ActivityIndicator color={colors.red} />
            : <Text style={styles.logoutText}>Se déconnecter</Text>
          }
        </TouchableOpacity>

        <Text style={styles.versionText}>AANID v1.0</Text>
      </ScrollView>

      <EditProfileModal
        visible={showEditModal}
        user={user}
        onClose={() => setShowEditModal(false)}
        onSaved={setUser}
      />

      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
  },

  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  avatar: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: colors.white, fontWeight: '700', fontFamily: 'CenturyGothic' },
  profileName: { ...typography.h3, marginTop: spacing.xs },
  profileEmail: { ...typography.caption, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.badge,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  editProfileButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  editProfileButtonText: { color: colors.primary, fontWeight: '600', fontSize: 14 },

  card: {
    margin: spacing.md,
    marginBottom: 0,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.md,
    ...shadows.card,
  },
  cardTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.8,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoLabel: { ...typography.caption },
  infoValue: { ...typography.body, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  separator: { height: 1, backgroundColor: colors.surface, marginVertical: 2 },

  subscriptionBanner: {
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
    marginBottom: spacing.sm,
  },
  subscriptionPlanName: { ...typography.label, marginBottom: spacing.xs },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  featureCheck: { fontSize: 13, fontWeight: '700', marginRight: 6 },
  featureLabel: { ...typography.caption },
  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  upgradeButtonText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  actionLabel: { ...typography.body, fontWeight: '500' },
  actionHint: { ...typography.caption, marginTop: 2 },
  actionChevron: { color: colors.placeholder, fontSize: 22, fontWeight: '300' },

  logoutButton: {
    margin: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.red,
    borderRadius: radius.button,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: { color: colors.red, fontWeight: '700', fontSize: 15 },
  buttonDisabled: { opacity: 0.6 },

  versionText: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
    color: colors.placeholder,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    ...shadows.card,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.placeholder,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h3, marginBottom: spacing.md },
  modalButtons: { flexDirection: 'row', gap: spacing.sm },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: colors.placeholder,
    borderRadius: radius.button,
    height: 44,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: { color: colors.textSecondary, fontWeight: '600', fontSize: 15 },

  inputGroup: { marginBottom: spacing.sm },
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
  input: { flex: 1, ...typography.body, color: colors.textPrimary },
  eyeButton: { paddingHorizontal: spacing.xs },
  eyeText: { fontSize: 11, color: colors.primary, fontWeight: '600' },

  banner: {
    borderRadius: radius.button,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  bannerText: { color: colors.white, fontSize: 13 },

  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  primaryButtonText: { color: colors.white, fontWeight: '700', fontSize: 15 },

  successBox: { alignItems: 'center', paddingVertical: spacing.lg },
  successIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.green + '20',
    borderWidth: 2,
    borderColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successIconText: { fontSize: 24, color: colors.green, fontWeight: '700' },
  successText: { ...typography.body, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
  successHint: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
});
