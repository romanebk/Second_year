import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_FAMILY } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { api, getApiErrorMessage } from '../../api/client';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Entrez votre adresse email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setError('Trop de demandes. Réessayez dans une heure.');
      } else {
        setError(getApiErrorMessage(err, 'Envoi impossible. Veuillez réessayer.'));
      }
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
          {sent ? (
            <View style={styles.sentWrap}>
              <View style={styles.sentIcon}>
                <FontAwesomeIcon icon={faEnvelopeCircleCheck} size={30} color={COLORS.success} />
              </View>
              <Text style={styles.cardTitle}>Email envoyé</Text>
              <Text style={styles.sentDesc}>
                Si un compte existe pour {email.trim()}, un lien de réinitialisation vient d'être envoyé.
                Ouvrez le lien reçu, ou saisissez le code manuellement.
              </Text>
              <CustomButton title="J'ai reçu mon code" onPress={() => navigation.navigate('ResetPassword')} />
              <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Retour à la connexion</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.cardTitle}>Mot de passe oublié</Text>
              <Text style={styles.cardSubtitle}>
                Entrez l'email de votre compte : nous vous enverrons un lien de réinitialisation.
              </Text>

              <CustomInput icon="envelope" placeholder="Adresse email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {loading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
              ) : (
                <CustomButton title="Envoyer le lien" onPress={handleSubmit} />
              )}

              <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
                  <Text style={styles.link}>J'ai déjà un code</Text>
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
  linkRow: { alignItems: 'center', marginTop: 16 },
  sentWrap: { alignItems: 'stretch' },
  sentIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.success + '1F', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  sentDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, marginBottom: 20, fontFamily: FONT_FAMILY },
});
