import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullhorn, faGraduationCap, faClipboardList, faComments, faThumbtack,
  faCity, faTriangleExclamation, faChevronDown, faXmark,
  faMagnifyingGlass, faCheck, faStar, faEarthAfrica,
} from '@fortawesome/free-solid-svg-icons';
import { selectCurrentVille, setVille } from '../../../../frontend/src/store/slices/authSlice';
import { getVilleById, getVilles } from '../services/villeService';

const VILLE_ID_KEY = '@aanid/v1/ville_id';
const VILLE_NOM_KEY = '@aanid/v1/ville_nom';

// Palette "Sable" (harmonisée avec le thème global)
const COLORS = {
  primary: '#C19A6B',
  primaryDark: '#9C7C4F',
  bleu: '#C19A6B',
  orange: '#D9A441',
  vert: '#6E8B5B',
  rouge: '#C75D4F',
  violet: '#8C6A43',
  grisClair: '#F9F1E5',
  gris: '#7A7166',
  grisMoyen: '#A89E90',
  noir: '#2E2A24',
  blanc: '#FFFFFF',
};

const TYPE_ICONS = {
  relais: faBullhorn,
  formations: faGraduationCap,
  etats: faClipboardList,
  posts: faComments,
};

const TYPE_LABELS = {
  relais: 'Relais Publicitaire',
  formations: 'Formations',
  etats: 'États des Lieux',
  posts: 'Posts / Réseaux',
};

const TYPE_SCREENS = {
  relais: 'Publicite',
  formations: 'Formation',
  etats: 'EtatsDesLieux',
  posts: 'Social',
};

function formatNumber(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function RubriqueCard({ rubrique, onPress }) {
  const icon = TYPE_ICONS[rubrique.id] || faThumbtack;
  const label = rubrique.label || TYPE_LABELS[rubrique.id] || rubrique.id;
  const color = COLORS.primaryDark;

  return (
    <TouchableOpacity
      style={styles.rubriqueCard}
      onPress={() => onPress(rubrique)}
      activeOpacity={0.7}
    >
      <View style={styles.rubriqueRow}>
        <View style={styles.rubriqueIconWrap}>
          <FontAwesomeIcon icon={icon} size={18} color={color} />
        </View>
        <View style={styles.rubriqueInfo}>
          <Text style={styles.rubriqueTitle}>{label}</Text>
          <Text style={styles.rubriqueDesc} numberOfLines={1}>{rubrique.description}</Text>
        </View>
        <View style={styles.rubriqueBadge}>
          <Text style={styles.rubriqueBadgeText}>{rubrique.count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function VilleDetail({ ville, isFavorite, onToggleFavorite, onRubriquePress, showWelcome }) {
  const panneauxPct = ville.stats.panneaux.total > 0
    ? Math.round((ville.stats.panneaux.disponibles / ville.stats.panneaux.total) * 100)
    : 0;
  const signalementsPct = ville.stats.signalements.total > 0
    ? Math.round((ville.stats.signalements.resolus / ville.stats.signalements.total) * 100)
    : 0;
  return (
    <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
      {showWelcome && (
        <View style={[styles.welcomeBanner, { backgroundColor: COLORS.primaryDark }]}>
          <FontAwesomeIcon icon={faEarthAfrica} size={15} color={COLORS.blanc} />
          <Text style={styles.welcomeBannerText}>Bienvenue à {ville.nom} !</Text>
        </View>
      )}

      <View style={[styles.detailHeader, { backgroundColor: COLORS.primaryDark }]}>
        <View style={styles.detailHeaderContent}>
          <View style={styles.detailAvatarWrap}>
            <View style={styles.detailAvatar}>
              <Text style={styles.detailAvatarText}>{ville.nom[0]}</Text>
            </View>
            <TouchableOpacity
              style={styles.detailFavBtn}
              onPress={() => onToggleFavorite(ville.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesomeIcon icon={faStar} size={15} color={isFavorite ? '#D9A441' : '#A89E90'} />
            </TouchableOpacity>
          </View>
          <Text style={styles.detailTitle}>{ville.nom}</Text>
          <View style={styles.detailLocationRow}>
            <FontAwesomeIcon icon={faEarthAfrica} size={13} color="#E8DCC8" />
            <Text style={styles.detailSubtitle}>{ville.pays} · {ville.region}</Text>
          </View>
          <Text style={styles.detailDesc}>{ville.description}</Text>
        </View>
      </View>

      <View style={styles.quickStatsRow}>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatValue}>{formatNumber(ville.population)}</Text>
          <Text style={styles.quickStatLabel}>Population</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStat}>
          <Text style={[styles.quickStatValue, { color: COLORS.rouge }]}>{ville.stats.signalements.total}</Text>
          <Text style={styles.quickStatLabel}>Signalements</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStat}>
          <Text style={[styles.quickStatValue, { color: COLORS.vert }]}>{ville.stats.panneaux.disponibles}</Text>
          <Text style={styles.quickStatLabel}>Disponibles</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStat}>
          <Text style={[styles.quickStatValue, { color: COLORS.orange }]}>{formatNumber(ville.stats.utilisateurs)}</Text>
          <Text style={styles.quickStatLabel}>Membres</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>État des lieux</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Panneaux disponibles</Text>
              <Text style={styles.progressValue}>{panneauxPct}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: panneauxPct + '%', backgroundColor: COLORS.vert }]} />
            </View>
            <Text style={styles.progressDetail}>
              {ville.stats.panneaux.disponibles} dispo / {ville.stats.panneaux.total} total
            </Text>
          </View>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Signalements résolus</Text>
              <Text style={styles.progressValue}>{signalementsPct}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: signalementsPct + '%', backgroundColor: COLORS.orange }]} />
            </View>
            <Text style={styles.progressDetail}>
              {ville.stats.signalements.resolus} résolus / {ville.stats.signalements.total} total
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rubriques</Text>
        {ville.rubriques.map(r => (
          <RubriqueCard key={r.id} rubrique={r} onPress={onRubriquePress} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Panneaux par statut</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusChip, { backgroundColor: COLORS.vert + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.vert }]} />
            <Text style={styles.statusText}>{ville.stats.panneaux.disponibles} Disponibles</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: COLORS.orange + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.orange }]} />
            <Text style={styles.statusText}>{ville.stats.panneaux.loues} Loués</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: COLORS.rouge + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.rouge }]} />
            <Text style={styles.statusText}>{ville.stats.panneaux.maintenance} Maintenance</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default function Villes() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { villeId, villeNom } = useSelector(selectCurrentVille);

  const [ville, setVilleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [villes, setVilles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingVilles, setLoadingVilles] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchVille = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await getVilleById(id);
      setVilleData(data);
      if (isFirstLoad) {
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3000);
        setIsFirstLoad(false);
      }
    } catch {
      setVilleData(null);
    } finally {
      setLoading(false);
    }
  }, [isFirstLoad]);

  useEffect(() => {
    (async () => {
      if (villeId) {
        fetchVille(villeId);
      } else {
        try {
          const savedId = await AsyncStorage.getItem(VILLE_ID_KEY);
          const savedNom = await AsyncStorage.getItem(VILLE_NOM_KEY);
          if (savedId && savedNom) {
            dispatch(setVille({ villeId: savedId, villeNom: savedNom }));
            return;
          }
        } catch {}
        setLoading(false);
      }
    })();
  }, [villeId, fetchVille, dispatch]);

  const navigateToScreen = useCallback((screenName) => {
    try {
      navigation.navigate(screenName);
    } catch {
      console.warn('Navigation error:', screenName);
    }
  }, [navigation]);

  const handleRubriquePress = useCallback((rubrique) => {
    const screen = TYPE_SCREENS[rubrique.id];
    if (screen) navigateToScreen(screen);
  }, [navigateToScreen]);

  const toggleFavorite = useCallback((villeId) => {
    setFavorites(prev =>
      prev.includes(villeId) ? prev.filter(id => id !== villeId) : [...prev, villeId]
    );
  }, []);

  const openSwitcher = useCallback(async () => {
    setShowSwitcher(true);
    setLoadingVilles(true);
    try {
      const data = await getVilles();
      setVilles(data);
    } catch {
      setVilles([]);
    } finally {
      setLoadingVilles(false);
    }
  }, []);

  const handleCityTap = useCallback(async (id, nom) => {
    if (id === villeId) {
      setShowSwitcher(false);
      setSearchQuery('');
      return;
    }

    dispatch(setVille({ villeId: id, villeNom: nom }));
    setShowSwitcher(false);
    setSearchQuery('');
    setIsFirstLoad(true);

    try {
      await AsyncStorage.setItem(VILLE_ID_KEY, id);
      await AsyncStorage.setItem(VILLE_NOM_KEY, nom);
    } catch {}
  }, [villeId, dispatch]);

  // Grouper les villes par pays (sections)
  const sections = useMemo(() => {
    const map = {};
    villes.forEach(v => {
      if (!map[v.pays]) map[v.pays] = [];
      map[v.pays].push(v);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([pays, data]) => ({
        title: pays,
        data: data.filter(v =>
          v.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.pays.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter(s => s.data.length > 0);
  }, [villes, searchQuery]);

  // État : aucune ville sélectionnée
  if (!villeId) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconWrap}>
            <FontAwesomeIcon icon={faCity} size={44} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyText}>Bienvenue sur AANID</Text>
          <Text style={styles.emptySubtext}>
            Sélectionnez une ville pour découvrir{'\n'}ses informations et fonctionnalités.
          </Text>
          <TouchableOpacity style={styles.selectCityBtn} onPress={openSwitcher}>
            <Text style={styles.selectCityBtnText}>Choisir une ville</Text>
          </TouchableOpacity>
        </View>

        <CitySwitcherModal
          visible={showSwitcher}
          sections={sections}
          loading={loadingVilles}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCityTap={handleCityTap}
          onClose={() => { setShowSwitcher(false); setSearchQuery(''); }}
          currentVilleId={villeId}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.citySwitcherBtn} onPress={openSwitcher} activeOpacity={0.7}>
          <View style={[styles.cityAccentDot, { backgroundColor: ville?.couleur || COLORS.primary }]} />
          <View style={styles.citySwitcherLeft}>
            <Text style={styles.citySwitcherLabel}>Ville actuelle</Text>
            <View style={styles.citySwitcherRow}>
              <Text style={styles.citySwitcherName}>{villeNom || 'Choisir'}</Text>
              <FontAwesomeIcon icon={faChevronDown} size={12} color={COLORS.primaryDark} />
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{ville?.stats?.panneaux?.total || 0} panneaux</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : ville ? (
        <VilleDetail
          ville={ville}
          isFavorite={favorites.includes(ville.id)}
          onToggleFavorite={toggleFavorite}
          onRubriquePress={handleRubriquePress}
          showWelcome={showWelcome}
        />
      ) : (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconWrap}>
            <FontAwesomeIcon icon={faTriangleExclamation} size={40} color={COLORS.rouge} />
          </View>
          <Text style={styles.emptyText}>Ville introuvable</Text>
          <TouchableOpacity style={styles.selectCityBtn} onPress={openSwitcher}>
            <Text style={styles.selectCityBtnText}>Changer de ville</Text>
          </TouchableOpacity>
        </View>
      )}

      <CitySwitcherModal
        visible={showSwitcher}
        sections={sections}
        loading={loadingVilles}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCityTap={handleCityTap}
        onClose={() => { setShowSwitcher(false); setSearchQuery(''); }}
        currentVilleId={villeId}
      />
    </View>
  );
}

function CitySwitcherModal({ visible, sections, loading, searchQuery, onSearchChange, onCityTap, onClose, currentVilleId }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Changer de ville</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesomeIcon icon={faXmark} size={20} color="#A89E90" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalSearch}>
            <FontAwesomeIcon icon={faMagnifyingGlass} size={14} color="#A89E90" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Rechercher une ville..."
              placeholderTextColor="#A89E90"
              value={searchQuery}
              onChangeText={onSearchChange}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#C19A6B" style={{ marginTop: 40 }} />
          ) : sections.length === 0 ? (
            <Text style={styles.modalEmpty}>Aucune ville trouvée</Text>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.modalList}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faEarthAfrica} size={15} color={COLORS.primaryDark} />
                  <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
                  <Text style={styles.sectionHeaderCount}>{section.data.length}</Text>
                </View>
              )}
              renderItem={({ item }) => {
                const isSelected = currentVilleId === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.cityItem,
                      isSelected && styles.cityItemActive,
                    ]}
                    onPress={() => onCityTap(item.id, item.nom)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.cityDot, { backgroundColor: item.couleur || '#C19A6B' }]} />
                    <View style={styles.cityItemInfo}>
                      <Text style={styles.cityItemName}>{item.nom}</Text>
                      <Text style={styles.cityItemCountry}>{item.region}</Text>
                    </View>
                    {isSelected && <FontAwesomeIcon icon={faCheck} size={15} color="#C19A6B" />}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F1E5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },

  // ─── Welcome Banner ────────────────────────────────────────────
  welcomeBanner: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  welcomeBannerText: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // ─── Header (clair) ──────────────────────────────────────────
  header: {
    paddingTop: 6,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DCC8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  headerBadgeText: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.noir,
  },

  // ─── City Switcher dans le header ───────────────────────────
  citySwitcherBtn: { flex: 1, marginRight: 12, flexDirection: 'row', alignItems: 'center' },
  cityAccentDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  citySwitcherLeft: {},
  citySwitcherLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: COLORS.gris,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  citySwitcherRow: { flexDirection: 'row', alignItems: 'center' },
  citySwitcherName: {
    fontFamily: 'CenturyGothic',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.noir,
    marginRight: 8,
  },

  // ─── Select City Btn ──────────────────────────────────────────
  selectCityBtn: {
    backgroundColor: COLORS.bleu,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  selectCityBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.blanc,
  },

  // ─── Loading & Empty ──────────────────────────────────────────
  loadingText: {
    fontFamily: 'CenturyGothic',
    marginTop: 14,
    fontSize: 14,
    color: COLORS.gris,
  },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyIconWrap: { width: 92, height: 92, borderRadius: 46, backgroundColor: 'rgba(193,154,107,0.14)', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  emptyText: {
    fontFamily: 'CenturyGothic',
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.noir,
  },
  emptySubtext: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: COLORS.gris,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ─── Modale de sélection de ville ────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DCC8',
  },
  modalTitle: { fontFamily: 'CenturyGothic', fontSize: 18, fontWeight: '700', color: '#2E2A24' },
  modalClose: { fontSize: 20, color: '#A89E90', padding: 4 },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#F2E7D3',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  modalSearchIcon: { fontSize: 14, marginRight: 8 },
  modalSearchInput: { flex: 1, fontSize: 14, color: '#2E2A24', padding: 0 },
  modalList: { paddingHorizontal: 16, paddingBottom: 16 },
  modalEmpty: {
    textAlign: 'center',
    color: '#A89E90',
    marginTop: 30,
    fontFamily: 'CenturyGothic',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DCC8',
  },
  sectionHeaderTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: '#2E2A24',
    flex: 1,
  },
  sectionHeaderCount: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#A89E90',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  cityItemActive: { backgroundColor: '#EFE3CD' },
  cityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  cityItemInfo: { flex: 1 },
  cityItemName: { fontFamily: 'CenturyGothic', fontSize: 15, fontWeight: '600', color: '#2E2A24' },
  cityItemCountry: { fontFamily: 'CenturyGothic', fontSize: 12, color: '#7A7166', marginTop: 2 },
  cityCheck: { fontSize: 16, color: '#C19A6B', fontWeight: '700' },
  // ─── Detail View ──────────────────────────────────────────────
  detailContainer: { flex: 1, backgroundColor: '#F9F1E5' },
  detailHeader: { paddingBottom: 30, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  detailHeaderContent: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 },
  detailLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  detailAvatarWrap: { position: 'relative', marginBottom: 12 },
  detailAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAvatarText: { fontFamily: 'CenturyGothic', fontSize: 32, fontWeight: 'bold', color: COLORS.blanc },
  detailFavBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailFavIcon: { fontSize: 16, color: '#A89E90' },
  detailFavIconActive: { color: '#D9A441' },
  detailTitle: { fontFamily: 'CenturyGothic', fontSize: 26, fontWeight: 'bold', color: COLORS.blanc, textAlign: 'center' },
  detailSubtitle: { fontFamily: 'CenturyGothic', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  detailDesc: { fontFamily: 'CenturyGothic', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 10, lineHeight: 20, textAlign: 'center' },

  // ─── Quick Stats ──────────────────────────────────────────────
  quickStatsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -24,
    backgroundColor: COLORS.blanc,
    borderRadius: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#F0E6D6',
    shadowColor: '#2E2A24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  quickStat: { flex: 1, alignItems: 'center' },
  quickStatValue: { fontFamily: 'CenturyGothic', fontSize: 18, fontWeight: 'bold', color: COLORS.noir },
  quickStatLabel: { fontFamily: 'CenturyGothic', fontSize: 10, color: COLORS.gris, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  quickStatDivider: { width: 1, backgroundColor: '#E8DCC8', marginVertical: 6 },

  // ─── Sections ─────────────────────────────────────────────────
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontFamily: 'CenturyGothic', fontSize: 18, fontWeight: 'bold', color: COLORS.noir, marginBottom: 14 },

  // ─── Progress ─────────────────────────────────────────────────
  progressRow: { gap: 14 },
  progressItem: { backgroundColor: COLORS.blanc, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0E6D6', shadowColor: '#2E2A24', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontFamily: 'CenturyGothic', fontSize: 13, fontWeight: '600', color: COLORS.gris },
  progressValue: { fontFamily: 'CenturyGothic', fontSize: 14, fontWeight: '700', color: COLORS.noir },
  progressBar: { height: 8, backgroundColor: '#E8DCC8', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressDetail: { fontFamily: 'CenturyGothic', fontSize: 11, color: COLORS.grisMoyen, marginTop: 6 },

  // ─── Status Chips ─────────────────────────────────────────────
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontFamily: 'CenturyGothic', fontSize: 12, fontWeight: '600', color: COLORS.noir },

  // ─── Rubriques ────────────────────────────────────────────────
  rubriqueCard: { backgroundColor: COLORS.blanc, marginBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F0E6D6', shadowColor: '#2E2A24', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, overflow: 'hidden' },
  rubriqueRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rubriqueIconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14, backgroundColor: 'rgba(193,154,107,0.14)' },
  rubriqueIcon: { fontSize: 20 },
  rubriqueInfo: { flex: 1 },
  rubriqueTitle: { fontFamily: 'CenturyGothic', fontSize: 15, fontWeight: '700', color: COLORS.noir },
  rubriqueDesc: { fontFamily: 'CenturyGothic', fontSize: 12, color: COLORS.gris, marginTop: 2 },
  rubriqueBadge: { minWidth: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, backgroundColor: COLORS.primaryDark },
  rubriqueBadgeText: { fontFamily: 'CenturyGothic', fontSize: 13, fontWeight: 'bold', color: COLORS.blanc },
});
