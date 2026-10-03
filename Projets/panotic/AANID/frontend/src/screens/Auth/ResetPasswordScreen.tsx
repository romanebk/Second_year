import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_FAMILY } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { api, getApiErrorMessage } from '../../api/client';

export default function ResetPasswordScreen({ navigation, route }: any) {
  // Le token arrive soit par le lien email (/reset-password?token=...), soit saisi à la main
  const [token, setToken] = useState(route?.params?.token || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!token.trim()) {
      setError('Collez le code reçu par email.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token: token.trim(), newPassword: password });
      setDone(true);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Réinitialisation impossible. Le lien a peut-être expiré.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>aanid</Text>
          <Text style={styles.tagline}>Transformation Urbaine</Text>
        </View>

        <View style={styles.card}>
          {done ? (
            <View style={styles.doneWrap}>
              <View style={styles.doneIcon}>
                <FontAwesomeIcon icon={faCircleCheck} size={30} color={COLORS.success} />
              </View>
              <Text style={styles.cardTitle}>Mot de passe modifié</Text>
              <Text style={styles.doneDesc}>
                Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.
              </Text>
              <CustomButton title="Se connecter" onPress={() => navigation.navigate('Login')} />
            </View>
          ) : (
            <>
              <Text style={styles.cardTitle}>Nouveau mot de passe</Text>
              <Text style={styles.cardSubtitle}>
                Collez le code reçu par email puis choisissez un nouveau mot de passe
                (8 caractères min., majuscule, minuscule, chiffre et caractère spécial).
              </Text>

              <CustomInput icon="key" placeholder="Code de réinitialisation" value={token} onChangeText={setToken} autoCapitalize="none" />
              <CustomInput icon="lock" placeholder="Nouveau mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
              <CustomInput icon="lock" placeholder="Confirmer le mot de passe" value={confirm} onChangeText={setConfirm} secureTextEntry />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {loading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
              ) : (
                <CustomButton title="Réinitialiser" onPress={handleSubmit} />
              )}

              <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.link}>Renvoyer un code</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.link}>Retour à la connexion</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 28 },
  brand: { fontSize: 42, fontStyle: 'italic', fontWeight: '700', color: COLORS.primaryDark, fontFamily: FONT_FAMILY },
  tagline: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, fontFamily: FONT_FAMILY },
  card: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, shadowColor: COLORS.shadow, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 4, fontFamily: FONT_FAMILY },
  cardSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 19, fontFamily: FONT_FAMILY },
  errorText: { fontSize: 13, color: COLORS.error, marginBottom: 12, fontFamily: FONT_FAMILY },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  link: { fontSize: 13, color: COLORS.primary, fontWeight: '700', fontFamily: FONT_FAMILY },
  doneWrap: { alignItems: 'stretch' },
  doneIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.success + '1F', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  doneDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, marginBottom: 20, fontFamily: FONT_FAMILY },
});
