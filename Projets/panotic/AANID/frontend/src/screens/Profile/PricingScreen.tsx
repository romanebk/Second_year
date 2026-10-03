import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSeedling, faBriefcase, faBuilding, faStar, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { openKkiapay } from '@aanid/beni-momo-adnan-frontend/src/services/kkiapayWidget';
import { COLORS, FONT_FAMILY } from '../../constants/theme';
import { api, getApiErrorMessage } from '../../api/client';

const PLANS = [
  {
    tier: 'Amateur', price: 0, icon: faSeedling, color: COLORS.success,
    features: ['Signalements illimités', 'Accès à la carte interactive', 'Flux communautaire (UGC)'],
  },
  {
    tier: 'Professionnel', price: 5000, icon: faBriefcase, color: COLORS.warning, popular: true,
    features: ['Audit complet (PDF/CSV)', 'Certifications de formation', 'Statistiques de signalements'],
  },
  {
    tier: 'Régie', price: 25000, icon: faBuilding, color: COLORS.primary,
    features: ['Gestion complète de l\'inventaire', 'Analyses de campagnes publicitaires', 'Accès API administrateur'],
  },
];

export default function PricingScreen() {
  const [currentPlan, setCurrentPlan] = useState('Amateur');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successPlan, setSuccessPlan] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      const { data } = await api.get('/subscriptions/me');
      setCurrentPlan(data.plan || 'Amateur');
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const startCheckout = (tier: string) => {
    setSelectedTier(tier);
    setPhone('');
    setError('');
    setSuccessPlan(null);
  };

  const handlePay = async () => {
    if (!selectedTier) return;
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 8) {
      setError('Numéro de téléphone invalide');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let { data } = await api.post('/subscriptions/pay', { plan: selectedTier, phone: cleaned });

      if (data.status === 'requires_widget') {
        // Ouvrir le widget KKiaPay puis vérifier la transaction côté serveur
        const transactionId = await openKkiapay({
          amount: data.amount,
          publicKey: data.publicKey,
          sandbox: data.sandbox,
          phone: cleaned,
        });
        ({ data } = await api.post('/subscriptions/pay', {
          plan: selectedTier,
          phone: cleaned,
          transactionId,
        }));
      }

      if (data.status === 'approved') {
        setCurrentPlan(selectedTier);
        setSuccessPlan(selectedTier);
        setSelectedTier(null);
      } else {
        setError(data.message || 'Paiement non confirmé. Veuillez réessayer.');
      }
    } catch (e: any) {
      if (e?.response?.status === 401) {
        setError('Veuillez vous connecter pour souscrire à un forfait.');
      } else {
        setError(getApiErrorMessage(e, 'Le paiement a échoué. Veuillez réessayer.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = PLANS.find((p) => p.tier === selectedTier);

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nos Forfaits</Text>
        <Text style={styles.subtitle}>Choisissez le plan adapté à vos besoins.</Text>

        {successPlan && (
          <View style={styles.successBanner}>
            <FontAwesomeIcon icon={faCircleCheck} size={15} color={COLORS.success} />
            <Text style={styles.successBannerText}>Abonnement {successPlan} activé !</Text>
          </View>
        )}

        {error && !selectedTier ? <Text style={styles.errorText}>{error}</Text> : null}

        {PLANS.map((plan) => {
          const isCurrent = plan.tier === currentPlan;
          return (
            <View key={plan.tier} style={[styles.card, plan.popular && styles.cardPopular]}>
              {plan.popular && (
                <View style={styles.ribbon}>
                  <FontAwesomeIcon icon={faStar} size={10} color={COLORS.white} />
                  <Text style={styles.ribbonText}>POPULAIRE</Text>
                </View>
              )}

              <View style={styles.cardHeader}>
                <View style={[styles.tierIcon, { backgroundColor: plan.color + '1F' }]}>
                  <FontAwesomeIcon icon={plan.icon} size={18} color={plan.color} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.tierName}>{plan.tier}</Text>
                  {isCurrent && <Text style={styles.currentLabel}>Plan actuel</Text>}
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: plan.color }]}>{plan.price.toLocaleString()}</Text>
                <Text style={styles.priceCurrency}> FCFA</Text>
                <Text style={styles.priceSub}> /mois</Text>
              </View>

              <View style={styles.divider} />

              {plan.features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={[styles.checkCircle, { backgroundColor: plan.color + '1F' }]}>
                    <FontAwesomeIcon icon={faCheck} size={10} color={plan.color} />
                  </View>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}

              {isCurrent ? (
                <View style={styles.currentBtn}>
                  <Text style={styles.currentBtnText}>Forfait actuel</Text>
                </View>
              ) : plan.price === 0 ? (
                <View style={styles.currentBtn}>
                  <Text style={styles.currentBtnText}>Forfait de base</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: plan.color }]}
                  activeOpacity={0.85}
                  onPress={() => startCheckout(plan.tier)}
                >
                  <Text style={styles.btnText}>Choisir ce plan</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      {selectedPlan && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedTier(null)}
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(46,42,36,0.45)' }]}
          />
          <View style={styles.sheetWrap} pointerEvents="box-none">
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Forfait {selectedPlan.tier}</Text>
              <Text style={styles.sheetAmount}>{selectedPlan.price.toLocaleString()} FCFA / mois</Text>
              <Text style={styles.sheetLabel}>Numéro Mobile Money</Text>
              <TextInput
                style={styles.sheetInput}
                placeholder="+229 XX XX XX XX"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: selectedPlan.color }]}
                onPress={handlePay}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.btnText}>Payer {selectedPlan.price.toLocaleString()} FCFA</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedTier(null)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 6, fontFamily: FONT_FAMILY },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 26, fontFamily: FONT_FAMILY },
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.success + '1F',
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  successBannerText: { fontSize: 13, fontWeight: '700', color: COLORS.success, fontFamily: FONT_FAMILY },
  errorText: { fontSize: 13, color: COLORS.error, marginBottom: 12, fontFamily: FONT_FAMILY },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 22, padding: 22, marginBottom: 18,
    borderWidth: 1, borderColor: '#F0E6D6',
    shadowColor: COLORS.shadow, shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  cardPopular: { borderColor: COLORS.warning, borderWidth: 2 },
  ribbon: {
    position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.warning, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  ribbonText: { color: COLORS.white, fontSize: 9, fontWeight: '800', letterSpacing: 0.5, fontFamily: FONT_FAMILY },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  tierIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerText: { marginLeft: 12 },
  tierName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, fontFamily: FONT_FAMILY },
  currentLabel: { fontSize: 11, color: COLORS.success, fontWeight: '600', marginTop: 2, fontFamily: FONT_FAMILY },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  price: { fontSize: 32, fontWeight: '800', fontFamily: FONT_FAMILY },
  priceCurrency: { fontSize: 15, fontWeight: '700', color: COLORS.text, fontFamily: FONT_FAMILY },
  priceSub: { fontSize: 13, color: COLORS.textTertiary, fontFamily: FONT_FAMILY },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkCircle: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  featureText: { fontSize: 14, color: COLORS.textSecondary, flex: 1, fontFamily: FONT_FAMILY },
  btn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15, fontFamily: FONT_FAMILY },
  currentBtn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 8, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  currentBtnText: { color: COLORS.textTertiary, fontWeight: '700', fontSize: 15, fontFamily: FONT_FAMILY },
  sheetWrap: { flex: 1, justifyContent: 'center', padding: 24 },
  sheet: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 22, maxWidth: 420, width: '100%', alignSelf: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 12,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, fontFamily: FONT_FAMILY },
  sheetAmount: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginTop: 4, marginBottom: 14, fontFamily: FONT_FAMILY },
  sheetLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 8, fontFamily: FONT_FAMILY },
  sheetInput: {
    backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.text, marginBottom: 14, fontFamily: FONT_FAMILY,
  },
  cancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  cancelBtnText: { fontSize: 13, color: COLORS.textTertiary, fontFamily: FONT_FAMILY },
});
