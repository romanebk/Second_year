import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, StatusBar, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCredentials } from '../../store/slices/authSlice';
import { COLORS, FONT_FAMILY } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialButtons from '../../components/SocialButtons';
import { api, getApiErrorMessage } from '../../api/client';

const VILLE_ID_KEY = '@aanid/v1/ville_id';
const VILLE_NOM_KEY = '@aanid/v1/ville_nom';
const ACCESS_TOKEN_KEY = '@aanid/v1/access_token';
const REFRESH_TOKEN_KEY = '@aanid/v1/refresh_token';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      const token = data.accessToken;
      const u = data.user;

      let villeId: string | undefined;
      let villeNom: string | undefined;
      try {
        villeId = (await AsyncStorage.getItem(VILLE_ID_KEY)) || undefined;
        villeNom = (await AsyncStorage.getItem(VILLE_NOM_KEY)) || undefined;
      } catch { /* ignore */ }

      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
      if (data.refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);

      dispatch(setCredentials({
        user: {
          id: u.id,
          email: u.email,
          firstName: u.fullName?.split(' ')[0] || 'Citoyen',
          fullName: u.fullName,
          role: u.role,
          villeId,
          villeNom,
        },
        token,
      }));
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Connexion impossible. Vérifiez vos identifiants.');
      if (err?.response?.status === 403 && err?.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        Alert.alert('Email non vérifié', 'Vérifiez votre boîte mail avant de vous connecter.');
      } else {
        Alert.alert('Erreur', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>aanid</Text>
          <Text style={styles.tagline}>Transformation Urbaine</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connexion</Text>
          <Text style={styles.cardSubtitle}>Connectez-vous pour continuer</Text>

          <CustomInput icon="envelope" placeholder="Adresse email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <CustomInput icon="lock" placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={styles.forgotRow} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
          ) : (
            <CustomButton title="Se connecter" onPress={handleLogin} />
          )}

          <SocialButtons />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
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
  cardSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20, fontFamily: FONT_FAMILY },
  forgotRow: { alignSelf: 'flex-end', marginBottom: 16, marginTop: -4 },
  forgotText: { fontSize: 13, color: COLORS.primary, fontWeight: '600', fontFamily: FONT_FAMILY },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: COLORS.textSecondary, fontFamily: FONT_FAMILY },
  footerLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700', fontFamily: FONT_FAMILY },
});
