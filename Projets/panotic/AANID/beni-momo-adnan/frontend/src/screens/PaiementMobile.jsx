import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCircleCheck, faLock } from '@fortawesome/free-solid-svg-icons';
import { payForFormation } from '../services/formationService';
import { openKkiapay } from '../services/kkiapayWidget';

export default function PaiementMobile() {
  const route = useRoute();
  const navigation = useNavigation();
  const { formationId, amount, currency, title, trancheLabel } = route.params;

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  // Après un paiement de tranche : reste dû et prochaine tranche éventuelle
  const [planAfter, setPlanAfter] = useState(null);

  const handlePay = async () => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 8) {
      setError('Numéro de téléphone invalide');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await payForFormation(formationId, cleaned);

      if (result.status === 'approved') {
        // Mode simulation (aucune clé KKiaPay configurée côté serveur)
        if (result.remaining !== undefined) setPlanAfter(result);
        setSuccess(true);
        return;
      }

      if (result.status === 'requires_widget') {
        // Ouvrir le widget KKiaPay puis vérifier la transaction côté serveur
        const transactionId = await openKkiapay({
          amount: result.amount,
          publicKey: result.publicKey,
          sandbox: result.sandbox,
          phone: cleaned,
        });
        const verified = await payForFormation(formationId, cleaned, transactionId);
        if (verified.status === 'approved') {
          if (verified.remaining !== undefined) setPlanAfter(verified);
          setSuccess(true);
        } else {
          setError(verified.message || 'Paiement non confirmé. Veuillez réessayer.');
        }
        return;
      }

      setError(result.message || 'Paiement non confirmé. Veuillez réessayer.');
    } catch (e) {
      setError(e.message || 'Erreur de paiement');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 44 }} color="#6E8B5B" />
          </View>
          <Text style={styles.successTitle}>Paiement réussi !</Text>
          {trancheLabel ? <Text style={styles.successTranche}>{trancheLabel}</Text> : null}
          <Text style={styles.successAmount}>
            {amount.toLocaleString()} {currency}
          </Text>
          <Text style={styles.successDesc}>
            {planAfter
              ? planAfter.isFullyPaid
                ? 'Formation entièrement payée. Tous les modules sont débloqués.'
                : `Reste à payer : ${(planAfter.remaining || 0).toLocaleString()} ${currency}${planAfter.nextTranche ? `\nProchaine tranche : ${planAfter.nextTranche.label} (${planAfter.nextTranche.amount.toLocaleString()} ${currency})` : ''}`
              : 'Vous pouvez maintenant vous inscrire à la formation.'}
          </Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('FormationDetail', { formationId })}
          >
            <Text style={styles.doneBtnText}>Continuer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 16 }} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement Mobile Money</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Formation</Text>
          <Text style={styles.summaryTitle} numberOfLines={2}>{title}</Text>
          {trancheLabel ? (
            <>
              <View style={styles.summaryDivider} />
              <Text style={styles.summaryLabel}>Tranche</Text>
              <Text style={styles.summaryTranche}>{trancheLabel}</Text>
            </>
          ) : null}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Montant</Text>
            <Text style={styles.summaryPrice}>{amount.toLocaleString()} {currency}</Text>
          </View>
        </View>

        <Text style={styles.instruction}>
          Entrez votre numéro Mobile Money (MTN ou Moov), puis finalisez le paiement
          dans la fenêtre sécurisée KKiaPay.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Numéro de téléphone</Text>
          <TextInput
            style={styles.input}
            placeholder="+229 XX XX XX XX"
            placeholderTextColor="#C9BBA4"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>
              Payer {amount.toLocaleString()} {currency}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.secureRow}>
          <FontAwesomeIcon icon={faLock} style={{ fontSize: 10 }} color="#A89E90" />
          <Text style={styles.secureText}>Paiement sécurisé via KKiaPay (Mobile Money & cartes)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F1E5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C7C4F',
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  body: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0E6D6',
    shadowColor: '#2E2A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  summaryLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#A89E90',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: '#2E2A24',
    marginTop: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E8DCC8',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryPrice: {
    fontFamily: 'CenturyGothic',
    fontSize: 20,
    fontWeight: '700',
    color: '#C19A6B',
  },
  summaryTranche: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: '#9C7C4F',
    marginTop: 4,
  },
  successTranche: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: '#9C7C4F',
    marginBottom: 6,
    textAlign: 'center',
  },
  instruction: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#7A7166',
    lineHeight: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    fontWeight: '600',
    color: '#2E2A24',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#2E2A24',
    fontFamily: 'CenturyGothic',
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  errorText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#C75D4F',
    marginBottom: 12,
  },
  payBtn: {
    backgroundColor: '#C19A6B',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C19A6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  payBtnDisabled: {
    opacity: 0.7,
  },
  payBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  secureText: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#A89E90',
    textAlign: 'center',
  },
  successCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(110,139,91,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 22,
    fontWeight: '700',
    color: '#2E2A24',
    marginBottom: 8,
  },
  successAmount: {
    fontFamily: 'CenturyGothic',
    fontSize: 28,
    fontWeight: '700',
    color: '#C19A6B',
    marginBottom: 12,
  },
  successDesc: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#7A7166',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  doneBtn: {
    backgroundColor: '#C19A6B',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    shadowColor: '#C19A6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  doneBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
