import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Platform } from 'react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCheck, faCircleCheck, faFilePdf, faLock } from '@fortawesome/free-solid-svg-icons';
import { getFormationById, updateProgress } from '../services/formationService';
import { getApiOrigin } from '@aanid/shared/api';

function buildPdfUrl(pdfUrl) {
  if (!pdfUrl) return null;
  if (pdfUrl.startsWith('http')) return pdfUrl;
  const origin = getApiOrigin();
  const path = pdfUrl.startsWith('/api/v1') ? pdfUrl : `/api/v1${pdfUrl.startsWith('/') ? pdfUrl : `/${pdfUrl}`}`;
  return `${origin}${path}`;
}

export default function CoursePlayer() {
  const route = useRoute();
  const navigation = useNavigation();
  const { formationId, moduleIndex: initialModule } = route.params;

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(initialModule || 0);
  const [modulesCompleted, setModulesCompleted] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  const pdfUrl = useMemo(() => buildPdfUrl(formation?.pdfUrl), [formation?.pdfUrl]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFormationById(formationId);
        setFormation(data);
        setModulesCompleted(data.userProgress?.modulesCompleted || []);
      } catch {
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [formationId, navigation]);

  const currentModule = formation?.modules?.[currentIndex];

  const handleToggleComplete = useCallback(async () => {
    if (!formation || !currentModule) return;
    setSaving(true);
    try {
      const isCurrentlyComplete = modulesCompleted.includes(currentModule.id);
      const result = await updateProgress(formationId, currentModule.id, !isCurrentlyComplete);
      setModulesCompleted(result.modulesCompleted);
    } catch {
      alert("Erreur lors de la mise à jour de la progression");
    } finally {
      setSaving(false);
    }
  }, [formation, currentModule, formationId, modulesCompleted]);

  const handleNext = () => {
    if (currentIndex < (formation?.modules?.length || 1) - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#C19A6B" />
      </View>
    );
  }

  if (!formation || !currentModule) return null;

  if (showPdf && pdfUrl) {
    const viewerUrl = Platform.OS === 'android'
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`
      : pdfUrl;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setShowPdf(false)}>
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 15 }} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>Document PDF</Text>
            <Text style={styles.headerSubtitle}>Formation v{formation.version || '1.0'}</Text>
          </View>
        </View>
        <WebView
          source={{ uri: viewerUrl }}
          style={styles.pdfViewer}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#C19A6B" />
            </View>
          )}
        />
      </View>
    );
  }

  // Module verrouillé (tranche non payée) : proposer le paiement
  if (currentModule.locked) {
    const nextTranche = formation.payment?.nextTranche;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 15 }} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>{formation.title}</Text>
            <Text style={styles.headerSubtitle}>Module verrouillé</Text>
          </View>
        </View>
        <View style={styles.lockedContainer}>
          <View style={styles.lockedIcon}>
            <FontAwesomeIcon icon={faLock} style={{ fontSize: 30 }} color="#9C7C4F" />
          </View>
          <Text style={styles.lockedTitle}>{currentModule.title}</Text>
          <Text style={styles.lockedDesc}>
            Ce module est verrouillé. Payez la tranche correspondante pour y accéder.
          </Text>
          {nextTranche && (
            <TouchableOpacity
              style={styles.lockedPayBtn}
              onPress={() =>
                navigation.navigate('PaiementMobile', {
                  formationId: formation.id,
                  amount: nextTranche.amount,
                  currency: formation.currency,
                  title: formation.title,
                  trancheLabel: nextTranche.label,
                })
              }
            >
              <Text style={styles.lockedPayBtnText}>
                Payer « {nextTranche.label} » — {nextTranche.amount.toLocaleString()} FCFA
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.lockedBackBtn}
            onPress={() => navigation.navigate('FormationDetail', { formationId: formation.id })}
          >
            <Text style={styles.lockedBackBtnText}>Voir l'échéancier de paiement</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalModules = formation.modules.length;
  const completedCount = modulesCompleted.length;
  const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  const isCurrentComplete = modulesCompleted.includes(currentModule.id);
  const allComplete = completedCount === totalModules;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 15 }} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{formation.title}</Text>
          <Text style={styles.headerSubtitle}>
            Module {currentIndex + 1}/{totalModules}
          </Text>
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {pdfUrl && (
          <TouchableOpacity style={styles.pdfBtn} onPress={() => setShowPdf(true)} activeOpacity={0.85}>
            <FontAwesomeIcon icon={faFilePdf} size={16} color="#9C7C4F" />
            <Text style={styles.pdfBtnText}>Consulter le document PDF complet</Text>
          </TouchableOpacity>
        )}
        {currentModule.imageUrl && (
          <Image source={{ uri: currentModule.imageUrl }} style={styles.moduleImage} />
        )}
        <Text style={styles.moduleTitle}>{currentModule.title}</Text>
        <Text style={styles.moduleDuration}>{currentModule.duration}</Text>
        <View style={styles.divider} />
        <Text style={styles.moduleContent}>{currentModule.content}</Text>
      </ScrollView>

      <View style={styles.footer}>
        {allComplete && (
          <View style={styles.allCompleteBanner}>
            <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 15 }} color="#6E8B5B" />
            <Text style={styles.allCompleteText}>
              Félicitations ! Tous les modules sont terminés.
            </Text>
          </View>
        )}

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 12 }} color={currentIndex === 0 ? '#C9BBA4' : '#9C7C4F'} />
            <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>
              Précédent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.completeBtn, isCurrentComplete && styles.completeBtnDone]}
            onPress={handleToggleComplete}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.completeBtnInner}>
                {isCurrentComplete && <FontAwesomeIcon icon={faCheck} style={{ fontSize: 12 }} color="#fff" />}
                <Text style={styles.completeBtnText}>
                  {isCurrentComplete ? 'Terminé' : 'Marquer terminé'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, currentIndex >= totalModules - 1 && styles.navBtnDisabled]}
            onPress={handleNext}
            disabled={currentIndex >= totalModules - 1}
          >
            <Text style={[styles.navBtnText, currentIndex >= totalModules - 1 && styles.navBtnTextDisabled]}>
              Suivant
            </Text>
            <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} color={currentIndex >= totalModules - 1 ? '#C9BBA4' : '#9C7C4F'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.quitBtn}
          onPress={() => navigation.navigate('FormationDetail', { formationId })}
        >
          <Text style={styles.quitBtnText}>Retour à la formation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#9C7C4F',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backBtnText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E0D2BB',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#C19A6B',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 24,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9F1E5',
    borderWidth: 1,
    borderColor: '#E8DCC8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  pdfBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '600',
    color: '#9C7C4F',
    flex: 1,
  },
  pdfViewer: {
    flex: 1,
    backgroundColor: '#F9F1E5',
  },
  moduleImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  moduleTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 20,
    fontWeight: '700',
    color: '#2E2A24',
    marginBottom: 6,
  },
  moduleDuration: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#A89E90',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8DCC8',
    marginBottom: 16,
  },
  moduleContent: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#7A7166',
    lineHeight: 22,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E8DCC8',
    padding: 16,
    paddingBottom: 32,
  },
  allCompleteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(110,139,91,0.14)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  allCompleteText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#5C7349',
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#9C7C4F',
    fontWeight: '600',
  },
  navBtnTextDisabled: {
    color: '#C9BBA4',
  },
  completeBtn: {
    backgroundColor: '#C19A6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#C19A6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  completeBtnDone: {
    backgroundColor: '#6E8B5B',
    shadowColor: '#6E8B5B',
  },
  completeBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completeBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  quitBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  quitBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#A89E90',
    textDecorationLine: 'underline',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  lockedIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F2E7D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockedTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 18,
    fontWeight: '700',
    color: '#2E2A24',
    textAlign: 'center',
    marginBottom: 10,
  },
  lockedDesc: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#7A7166',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  lockedPayBtn: {
    backgroundColor: '#C19A6B',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  lockedPayBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  lockedBackBtn: {
    marginTop: 14,
    paddingVertical: 10,
  },
  lockedBackBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#9C7C4F',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
