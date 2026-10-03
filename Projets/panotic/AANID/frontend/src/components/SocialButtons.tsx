import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS, FONT_FAMILY } from '../constants/theme';
import { API_BASE_URL } from '../config/api';
import { api, getApiErrorMessage } from '../api/client';
import { setCredentials } from '../store/slices/authSlice';

const SOCIALS = [
  { key: 'google', label: 'Google', icon: 'google', color: '#DB4437' },
  { key: 'facebook', label: 'Facebook', icon: 'facebook-f', color: '#1877F2' },
  { key: 'x', label: 'X', icon: 'x-twitter', color: COLORS.text },
] as const;

export default function SocialButtons() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const exchangingCode = useRef<string | null>(null);

  useEffect(() => {
    api.get('/auth/oauth/providers')
      .then(({ data }) => setEnabled(data.providers || {}))
      .catch(() => setEnabled({}));
  }, []);

  const finishLogin = useCallback(async (code: string) => {
    if (!code || exchangingCode.current === code) return;
    exchangingCode.current = code;
    setLoading('exchange');
    try {
      const { data } = await api.post('/auth/oauth/exchange', { code });
      await AsyncStorage.setItem('@aanid/v1/access_token', data.accessToken);
      if (data.refreshToken) {
        await AsyncStorage.setItem('@aanid/v1/refresh_token', data.refreshToken);
      }
      dispatch(setCredentials({
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.fullName?.split(' ')[0] || 'Citoyen',
          fullName: data.user.fullName,
          role: data.user.role,
        },
        token: data.accessToken,
      }));
    } catch (error) {
      exchangingCode.current = null;
      Alert.alert('Connexion impossible', getApiErrorMessage(error, 'Le code de connexion sociale est invalide.'));
    } finally {
      setLoading(null);
    }
  }, [dispatch]);

  const handleCallback = useCallback((url?: string | null) => {
    if (!url || !url.startsWith('aanid://oauth/callback')) return;
    const query = url.split('?')[1] || '';
    const values: Record<string, string> = {};
    query.split('&').forEach((part) => {
      const [rawKey, rawValue = ''] = part.split('=');
      if (rawKey) values[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.replace(/\+/g, ' '));
    });
    if (values.error) {
      setLoading(null);
      const messages: Record<string, string> = {
        access_denied: 'Connexion annulée.',
        invalid_state: 'La demande de connexion a expiré. Réessayez.',
        provider_error: 'Le fournisseur n’a pas pu valider la connexion.',
      };
      Alert.alert('Connexion impossible', messages[values.error] || 'La connexion sociale a échoué.');
      return;
    }
    if (values.code) finishLogin(values.code);
  }, [finishLogin]);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => handleCallback(url));
    Linking.getInitialURL().then(handleCallback).catch(() => {});
    return () => subscription.remove();
  }, [handleCallback]);

  const startLogin = async (provider: string) => {
    if (!enabled[provider]) {
      Alert.alert('Indisponible', 'Ce fournisseur doit encore être configuré par l’administrateur.');
      return;
    }
    setLoading(provider);
    try {
      const redirectUri = 'aanid://oauth/callback';
      const url = `${API_BASE_URL}/auth/oauth/${provider}/start?redirectUri=${encodeURIComponent(redirectUri)}`;
      await Linking.openURL(url);
    } catch {
      setLoading(null);
      Alert.alert('Connexion impossible', 'Impossible d’ouvrir la page de connexion.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.or}>OU</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.row}>
        {SOCIALS.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.btn, enabled[s.key] === false && styles.btnDisabled]}
            onPress={() => startLogin(s.key)}
            disabled={Boolean(loading)}
            accessibilityRole="button"
            accessibilityLabel={`Continuer avec ${s.label}`}
          >
            {loading === s.key ? (
              <ActivityIndicator size="small" color={COLORS.primaryDark} />
            ) : (
              <Icon name={s.icon} size={21} color={s.color} brand />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  or: { marginHorizontal: 12, fontSize: 12, color: COLORS.textTertiary, fontWeight: '600', fontFamily: FONT_FAMILY },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  btn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: COLORS.backgroundAlt, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  btnDisabled: { opacity: 0.45 },
});
