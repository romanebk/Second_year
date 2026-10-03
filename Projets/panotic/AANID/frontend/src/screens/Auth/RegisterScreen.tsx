import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, StatusBar, TouchableOpacity, SafeAreaView, Modal, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { setCredentials } from '../../store/slices/authSlice';
import { COLORS, FONT_FAMILY } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialButtons from '../../components/SocialButtons';
import { api, getApiErrorMessage } from '../../api/client';

import { API_BASE_URL } from '../../config/api';
const VILLE_ID_KEY = '@aanid/v1/ville_id';
const VILLE_NOM_KEY = '@aanid/v1/ville_nom';
const ACCESS_TOKEN_KEY = '@aanid/v1/access_token';
const REFRESH_TOKEN_KEY = '@aanid/v1/refresh_token';

export default function RegisterScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [pays, setPays] = useState('');
  const [villeId, setVilleId] = useState('');
  const [villeNom, setVilleNom] = useState('');
  const [villes, setVilles] = useState([]);
  const [loadingVilles, setLoadingVilles] = useState(true);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/villes`);
        if (res.ok) {
          const data = await res.json();
          setVilles(Array.isArray(data) ? data : []);
        }
      } catch {
        // API indisponible
      } finally {
        setLoadingVilles(false);
      }
    })();
  }, []);

  const countries = useMemo(() => {
    const unique = [...new Set(villes.map(v => v.pays))];
    return unique.sort();
  }, [villes]);

  const villesByCountry = useMemo(() => {
    if (!pays) return villes;
    return villes.filter(v => v.pays === pays);
  }, [villes, pays]);

  const filteredVilles = villesByCountry.filter(v =>
    v.nom.toLowerCase().includes(citySearch.toLowerCase()) ||
    v.pays.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    if (!pays) {
      Alert.alert('Pays requis', 'Veuillez sélectionner votre pays.');
      return;
    }
    if (!villeId) {
      Alert.alert('Ville requise', 'Veuillez sélectionner votre ville.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Mot de passe faible', 'Minimum 8 caractères avec majuscule, minuscule, chiffre et caractère spécial (@$!%*?&-_#).');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/register', {
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        city: villeNom,
        password,
        role: 'CITOYEN',
      });

      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      const token = data.accessToken;
      const u = data.user;

      await AsyncStorage.setItem(VILLE_ID_KEY, villeId);
      await AsyncStorage.setItem(VILLE_NOM_KEY, villeNom);
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
      if (data.refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);

      dispatch(setCredentials({
        user: {
          id: u.id,
          email: u.email,
          firstName: u.fullName?.split(' ')[0] || name.split(' ')[0],
          fullName: u.fullName,
          role: u.role,
          pays,
          villeId,
          villeNom,
        },
        token,
      }));
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Inscription impossible. Vérifiez vos informations.');
      Alert.alert('Erreur', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>aanid</Text>
          <Text style={styles.tagline}>Créez votre compte</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inscription</Text>
          <Text style={styles.cardSubtitle}>Rejoignez la communauté</Text>

          <CustomInput icon="user" placeholder="Nom complet" value={name} onChangeText={setName} />
          <CustomInput icon="envelope" placeholder="Adresse email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <CustomInput icon="phone" placeholder="Téléphone" value={phone} onChangeText={setPhone} />

          <TouchableOpacity
            style={[styles.selector, !pays && styles.selectorEmpty]}
            onPress={() => setShowCountryPicker(true)}
            activeOpacity={0.7}
          >
            <Icon name="earth-africa" size={17} color={COLORS.primaryDark} style={styles.selectorIcon} />
            <Text style={[styles.selectorText, !pays && styles.selectorTextEmpty]}>
              {pays || 'Sélectionnez votre pays'}
            </Text>
            <Icon name="chevron-down" size={12} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selector, !villeId && styles.selectorEmpty, !pays && styles.selectorDisabled]}
            onPress={() => pays ? setShowCityPicker(true) : null}
            activeOpacity={pays ? 0.7 : 1}
          >
            <Icon name="location-dot" size={17} color={COLORS.primaryDark} style={styles.selectorIcon} />
            <Text style={[styles.selectorText, !villeId && styles.selectorTextEmpty]}>
              {villeNom || (pays ? 'Sélectionnez votre ville' : 'Choisissez d\'abord un pays')}
            </Text>
            <Icon name="chevron-down" size={12} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <CustomInput icon="lock" placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

          <CustomButton title="S'inscrire" onPress={handleRegister} loading={submitting} />

          <SocialButtons />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modale pays */}
      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir un pays</Text>
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowCountryPicker(false)} accessibilityLabel="Fermer">
                <Icon name="xmark" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={countries}
              keyExtractor={item => item}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={
                loadingVilles ? (
                  <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                ) : (
                  <Text style={styles.modalEmpty}>Aucun pays trouvé</Text>
                )
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, pays === item && styles.pickerItemActive]}
                  onPress={() => {
                    setPays(item);
                    setVilleId('');
                    setVilleNom('');
                    setShowCountryPicker(false);
                  }}
                >
                  <Icon name="earth-africa" size={17} color={COLORS.primaryDark} style={styles.pickerItemFlag} />
                  <Text style={styles.pickerItemText}>{item}</Text>
                  {pays === item && <Icon name="check" size={16} color={COLORS.primaryDark} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modale ville */}
      <Modal visible={showCityPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une ville</Text>
              <TouchableOpacity style={styles.iconButton} onPress={() => { setShowCityPicker(false); setCitySearch(''); }} accessibilityLabel="Fermer">
                <Icon name="xmark" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <Icon name="magnifying-glass" size={15} color={COLORS.textTertiary} style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Rechercher une ville..."
                placeholderTextColor="#9CA3AF"
                value={citySearch}
                onChangeText={setCitySearch}
              />
            </View>

            <FlatList
              data={filteredVilles}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>
                  {loadingVilles ? 'Chargement...' : 'Aucune ville trouvée'}
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, villeId === item.id && styles.pickerItemActive]}
                  onPress={() => {
                    setVilleId(item.id);
                    setVilleNom(item.nom);
                    setShowCityPicker(false);
                    setCitySearch('');
                  }}
                >
                  <View style={[styles.cityDot, { backgroundColor: item.couleur || COLORS.primary }]} />
                  <View style={styles.pickerItemInfo}>
                    <Text style={styles.pickerItemTitle}>{item.nom}</Text>
                    <Text style={styles.pickerItemSub}>{item.region}</Text>
                  </View>
                  {villeId === item.id && <Icon name="check" size={16} color={COLORS.primaryDark} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Écran de bienvenue */}
      <Modal visible={showWelcome} animationType="fade" transparent>
        <View style={styles.welcomeOverlay}>
          <View style={styles.welcomeCard}>
            <Icon name="circle-check" size={52} color={COLORS.success} style={styles.welcomeIcon} />
            <Text style={styles.welcomeTitle}>Bienvenue, {name.split(' ')[0]} !</Text>
            <Text style={styles.welcomeSubtitle}>
              Vous êtes maintenant membre de la communauté AANID
            </Text>
            <View style={styles.welcomeCityRow}>
              <Icon name="location-dot" size={16} color={COLORS.primaryDark} style={styles.welcomeCityPin} />
              <Text style={styles.welcomeCityName}>{villeNom}</Text>
            </View>
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  brand: { fontSize: 44, fontWeight: '800', fontStyle: 'italic', color: COLORS.primaryDark, fontFamily: FONT_FAMILY },
  tagline: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, marginTop: 4, fontFamily: FONT_FAMILY },
  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 32, elevation: 12, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.14, shadowRadius: 40 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 4, fontFamily: FONT_FAMILY },
  cardSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32, fontFamily: FONT_FAMILY },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: FONT_FAMILY },
  footerLink: { color: COLORS.primary, fontSize: 13, fontWeight: '700', fontFamily: FONT_FAMILY },

  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectorEmpty: { borderColor: COLORS.primary, borderStyle: 'dashed' },
  selectorDisabled: { opacity: 0.5 },
  selectorIcon: { marginRight: 10 },
  selectorText: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500', fontFamily: FONT_FAMILY },
  selectorTextEmpty: { color: COLORS.placeholder, fontWeight: '400' },
  selectorArrow: { fontSize: 10, color: COLORS.textTertiary },

  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, fontFamily: FONT_FAMILY },
  iconButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', margin: -10 },
  modalSearch: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: COLORS.backgroundAlt, borderRadius: 12, paddingHorizontal: 14, height: 44 },
  modalSearchIcon: { marginRight: 8 },
  modalSearchInput: { flex: 1, fontSize: 14, color: COLORS.text, padding: 0, fontFamily: FONT_FAMILY },
  modalList: { paddingHorizontal: 16, paddingBottom: 16 },
  modalEmpty: { textAlign: 'center', color: COLORS.textTertiary, marginTop: 30, fontSize: 14, fontFamily: FONT_FAMILY },

  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
  pickerItemActive: { backgroundColor: COLORS.chipBg },
  pickerItemFlag: { marginRight: 12 },
  pickerItemText: { fontSize: 15, fontWeight: '600', color: COLORS.text, flex: 1, fontFamily: FONT_FAMILY },
  pickerItemInfo: { flex: 1 },
  pickerItemTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, fontFamily: FONT_FAMILY },
  pickerItemSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontFamily: FONT_FAMILY },
  pickerCheck: { fontSize: 16, color: COLORS.primary, fontWeight: '700' },
  cityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },

  welcomeOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', padding: 32 },
  welcomeCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 36, alignItems: 'center', width: '100%', maxWidth: 320 },
  welcomeIcon: { marginBottom: 16 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center', fontFamily: FONT_FAMILY },
  welcomeSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 18, fontFamily: FONT_FAMILY },
  welcomeCityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: COLORS.chipBg, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  welcomeCityPin: { marginRight: 8 },
  welcomeCityName: { fontSize: 16, fontWeight: '700', color: COLORS.primaryDark, fontFamily: FONT_FAMILY },
});
