import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_FAMILY } from '../../constants/theme';
import CustomButton from '../../components/CustomButton';
import { api, getApiErrorMessage } from '../../api/client';

export default function VerifyEmailScreen({ navigation, route }: any) {
  const token = route?.params?.token || '';
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      if (!token) {
        setStatus('error');
        setMessage('Lien de vérification invalide.');
        return;
      }
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setStatus('ok');
        setMessage(data.message || 'Email vérifié avec succès.');
      } catch (err: any) {
        setStatus('error');
        setMessage(getApiErrorMessage(err, 'Lien de vérification invalide ou expiré.'));
      }
    })();
  }, [token]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.center}>
        <View style={styles.card}>
          {status === 'loading' ? (
            <>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.desc}>Vérification de votre email…</Text>
            </>
          ) : (
            <>
              <View style={[styles.icon, { backgroundColor: (status === 'ok' ? COLORS.success : COLORS.error) + '1F' }]}>
                <FontAwesomeIcon
                  icon={status === 'ok' ? faCircleCheck : faCircleXmark}
                  size={32}
                  color={status === 'ok' ? COLORS.success : COLORS.error}
                />
              </View>
              <Text style={styles.title}>{status === 'ok' ? 'Email vérifié' : 'Vérification échouée'}</Text>
              <Text style={styles.desc}>{message}</Text>
              <CustomButton title="Aller à la connexion" onPress={() => navigation.navigate('Login')} />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 28, alignItems: 'stretch', shadowColor: COLORS.shadow, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  icon: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 8, fontFamily: FONT_FAMILY },
  desc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 21, marginVertical: 12, fontFamily: FONT_FAMILY },
});
