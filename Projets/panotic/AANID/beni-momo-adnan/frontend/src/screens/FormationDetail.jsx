import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCheck, faCircleCheck, faLock } from '@fortawesome/free-solid-svg-icons';
import { getFormationById, enroll, unenroll, getPaymentStatus } from '../services/formationService';

function formatPrice(price, isFree) {
  if (isFree) return 'Gratuit';
  return `${price.toLocaleString()} FCFA`;
}

function formatFcfa(amount) {
  return `${(amount || 0).toLocaleString()} FCFA`;
}

export default function FormationDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { formationId } = route.params;

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);

  const loadFormation = useCallback(async () => {
    try {
      const data = await getFormationById(formationId);
      setFormation(data);
    } catch {
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [formationId, navigation]);

  useEffect(() => {
    loadFormation();
    // Re-charger au retour du paiement (tranches payées, modules débloqués)
    const unsubscribe = navigation.addListener('focus', loadFormation);
    return unsubscribe;
  }, [loadFormation, navigation]);

  // Ouvre le paiement de la prochaine tranche due (ou du prix total sans plan)
  const goToPayment = (tranche) => {
    navigation.navigate('PaiementMobile', {
      formationId,
      amount: tranche ? tranche.amount : formation.price,
      currency: formation.currency,
      title: formation.title,
      trancheLabel: tranche ? tranche.label : null,
    });
  };

  const handleEnroll = async () => {
    if (!formation.isFree) {
      try {
        const status = await getPaymentStatus(formationId);
        const canEnroll = status.plan ? status.canEnroll : status.isPaid;
        if (!canEnroll) {
          goToPayment(status.nextTranche || null);
          return;
        }
      } catch {
        goToPayment(formation.payment?.nextTranche || null);
        return;
      }
    }

    setEnrolling(true);
    try {
      await enroll(formationId);
      const updated = await getFormationById(formationId);
      setFormation(updated);
    } catch (e) {
      if (e.status === 401) {
        alert('Veuillez vous connecter pour vous inscrire');
      } else {
        alert(e.message || 'Inscription échouée. Veuillez réessayer.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    setUnenrolling(true);
    try {
      await unenroll(formationId);
      const updated = await getFormationById(formationId);
      setFormation(updated);
    } catch (e) {
      alert(e.message || 'Désinscription échouée');
    } finally {
      setUnenrolling(false);
    }
  };

  const getCategoryColor = () => {
    const colors = {
      PANNEAUTIQUE: '#C19A6B',
      ENVIRONNEMENT: '#B08C5E',
      SANTE: '#9C7C4F',
      INFRASTRUCTURE: '#6E5333',
    };
    return colors[formation?.category] || '#C19A6B';
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#C19A6B" />
      </View>
    );
  }

  if (!formation) return null;

  const isEnrolled = formation.isEnrolled;
  const allModulesComplete = formation.userProgress?.modulesCompleted?.length === formation.modules?.length;
  const progress = formation.userProgress
    ? Math.round((formation.userProgress.modulesCompleted.length / formation.modules.length) * 100)
    : 0;

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={[styles.hero, { backgroundColor: getCategoryColor() }]}>
        {formation.imageUrl && (
          <Image source={{ uri: formation.imageUrl }} style={styles.heroImage} />
        )}
        <View style={styles.heroOverlay} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 16 }} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>{formation.title}</Text>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>{formation.category}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{formation.duration}</Text>
            <Text style={styles.metaLabel}>Durée</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{formation.enrolledCount}/{formation.capacity}</Text>
            <Text style={styles.metaLabel}>Inscrits</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{formatPrice(formation.price, formation.isFree)}</Text>
            <Text style={styles.metaLabel}>Prix</Text>
          </View>
        </View>

        {isEnrolled && (
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>Progression</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}% complété</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{formation.description}</Text>

        {formation.payment && (
          <View style={styles.planCard}>
            <Text style={styles.sectionTitle}>Paiement en tranches</Text>
            <Text style={styles.planSummary}>
              Payé : {formatFcfa(formation.payment.totalPaid)} / {formatFcfa(formation.payment.plan.total)}
            </Text>
            <View style={styles.planBarBg}>
              <View
                style={[styles.planBarFill, {
                  width: `${Math.min(100, Math.round((formation.payment.totalPaid / formation.payment.plan.total) * 100))}%`,
                }]}
              />
            </View>
            {formation.payment.plan.tranches.map((t) => {
              const paid = formation.payment.paidTranches.includes(t.id);
              const isNext = formation.payment.nextTranche?.id === t.id;
              return (
                <View key={t.id} style={styles.trancheRow}>
                  <View style={[styles.trancheIcon, paid && styles.trancheIconPaid]}>
                    <FontAwesomeIcon
                      icon={paid ? faCheck : faLock}
                      style={{ fontSize: 11 }}
                      color={paid ? '#fff' : '#A89E90'}
                    />
                  </View>
                  <Text style={[styles.trancheLabel, paid && styles.trancheLabelPaid]} numberOfLines={2}>
                    {t.label}
                  </Text>
                  <Text style={[styles.trancheAmount, isNext && styles.trancheAmountNext]}>
                    {formatFcfa(t.amount)}
                  </Text>
                </View>
              );
            })}
            {formation.payment.nextTranche && (
              <TouchableOpacity
                style={styles.payTrancheBtn}
                onPress={() => goToPayment(formation.payment.nextTranche)}
              >
                <Text style={styles.payTrancheBtnText}>
                  Payer la tranche suivante — {formatFcfa(formation.payment.nextTranche.amount)}
                </Text>
              </TouchableOpacity>
            )}
            {formation.payment.isFullyPaid && (
              <View style={styles.planPaidBanner}>
                <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 14 }} color="#6E8B5B" />
                <Text style={styles.planPaidText}>Formation entièrement payée</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Modules ({formation.modules?.length || 0})</Text>
        {formation.modules?.map((mod, idx) => {
          const isModuleComplete = formation.userProgress?.modulesCompleted?.includes(mod.id);
          const isLocked = !!mod.locked;
          return (
            <TouchableOpacity
              key={mod.id}
              style={[styles.moduleRow, isModuleComplete && styles.moduleRowComplete, isLocked && styles.moduleRowLocked]}
              disabled={!isEnrolled && !isLocked}
              onPress={() => {
                if (isLocked) {
                  goToPayment(formation.payment?.nextTranche || null);
                } else if (isEnrolled) {
                  navigation.navigate('CoursePlayer', {
                    formationId: formation.id,
                    moduleIndex: idx,
                  });
                }
              }}
            >
              <View style={[styles.moduleNumber, isModuleComplete && styles.moduleNumberComplete, isLocked && styles.moduleNumberLocked]}>
                {isLocked ? (
                  <FontAwesomeIcon icon={faLock} style={{ fontSize: 12 }} color="#A89E90" />
                ) : isModuleComplete ? (
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: 13 }} color="#fff" />
                ) : (
                  <Text style={styles.moduleNumberText}>{idx + 1}</Text>
                )}
              </View>
              <View style={styles.moduleInfo}>
                <Text style={[styles.moduleTitle, isLocked && styles.moduleTitleLocked]}>{mod.title}</Text>
                <Text style={styles.moduleDuration}>
                  {isLocked ? 'Verrouillé — payez la tranche correspondante' : mod.duration}
                </Text>
              </View>
              {isLocked ? (
                <FontAwesomeIcon icon={faLock} style={{ fontSize: 13 }} color="#C9BBA4" />
              ) : (
                isEnrolled && <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 13 }} color="#C9BBA4" />
              )}
            </TouchableOpacity>
          );
        })}

        {!isEnrolled ? (
          <TouchableOpacity
            style={[styles.enrollBtn, { backgroundColor: getCategoryColor() }]}
            onPress={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.enrollBtnText}>
                {formation.isFree
                  ? "S'inscrire gratuitement"
                  : formation.payment && !formation.payment.paidTranches.includes(formation.payment.plan.tranches[0]?.id)
                    ? `S'inscrire — ${formatFcfa(formation.payment.plan.tranches[0]?.amount)}`
                    : "S'inscrire"}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.enrolledBanner}>
            <View style={styles.enrolledBannerHead}>
              <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} color="#6E8B5B" />
              <Text style={styles.enrolledBannerText}>
                {allModulesComplete ? 'Formation terminée !' : 'Vous êtes inscrit'}
              </Text>
            </View>
            {allModulesComplete && formation.userProgress?.completedAt && (
              <Text style={styles.completedDate}>
                Complétée le {new Date(formation.userProgress.completedAt).toLocaleDateString()}
              </Text>
            )}
            <View style={styles.enrolledActions}>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() =>
                  navigation.navigate('CoursePlayer', {
                    formationId: formation.id,
                    moduleIndex: 0,
                  })
                }
              >
                <Text style={styles.startBtnText}>
                  {allModulesComplete ? 'Revoir' : 'Commencer'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.unenrollBtn}
                onPress={handleUnenroll}
                disabled={unenrolling}
              >
                {unenrolling ? (
                  <ActivityIndicator size="small" color="#C75D4F" />
                ) : (
                  <Text style={styles.unenrollBtnText}>Se désinscrire</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F1E5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    paddingTop: 18,
    paddingBottom: 26,
    paddingHorizontal: 18,
    minHeight: 180,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  heroTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 28,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 12,
  },
  heroBadgeText: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  body: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0E6D6',
    shadowColor: '#2E2A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaValue: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: '#2E2A24',
  },
  metaLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#A89E90',
    marginTop: 3,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0E6D6',
    shadowColor: '#2E2A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  progressLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    fontWeight: '600',
    color: '#2E2A24',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#EFE3CD',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#C19A6B',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#A89E90',
    marginTop: 6,
    textAlign: 'right',
  },
  sectionTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: '#2E2A24',
    marginBottom: 10,
    marginTop: 8,
  },
  description: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#7A7166',
    lineHeight: 21,
    marginBottom: 16,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0E6D6',
    shadowColor: '#2E2A24',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  moduleRowComplete: {
    opacity: 0.75,
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C19A6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleNumberComplete: {
    backgroundColor: '#6E8B5B',
  },
  moduleNumberText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2A24',
  },
  moduleDuration: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#A89E90',
    marginTop: 2,
  },
  moduleArrow: {
    fontSize: 20,
    color: '#C9BBA4',
    marginLeft: 8,
  },
  enrollBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#C19A6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  enrollBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  enrolledBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F0E6D6',
    shadowColor: '#2E2A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  enrolledBannerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  enrolledBannerText: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    color: '#2E2A24',
    fontWeight: '700',
  },
  completedDate: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#9C7C4F',
    marginBottom: 10,
  },
  enrolledActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  startBtn: {
    flex: 1,
    backgroundColor: '#C19A6B',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  unenrollBtn: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6C9C3',
  },
  unenrollBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#C75D4F',
    fontWeight: '600',
  },
  startBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  planSummary: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: '#2E2A24',
    marginBottom: 8,
  },
  planBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F2E7D3',
    marginBottom: 14,
    overflow: 'hidden',
  },
  planBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#6E8B5B',
  },
  trancheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2E7D3',
  },
  trancheIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F2E7D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trancheIconPaid: {
    backgroundColor: '#6E8B5B',
  },
  trancheLabel: {
    flex: 1,
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#7A7166',
  },
  trancheLabelPaid: {
    color: '#2E2A24',
  },
  trancheAmount: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    fontWeight: '700',
    color: '#A89E90',
  },
  trancheAmountNext: {
    color: '#9C7C4F',
  },
  payTrancheBtn: {
    backgroundColor: '#C19A6B',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
  },
  payTrancheBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  planPaidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 12,
  },
  planPaidText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    fontWeight: '700',
    color: '#6E8B5B',
  },
  moduleRowLocked: {
    opacity: 0.75,
  },
  moduleNumberLocked: {
    backgroundColor: '#F2E7D3',
  },
  moduleTitleLocked: {
    color: '#A89E90',
  },
});
