import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal, faBookOpen, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { getMyFormations, getMyBadges } from '../services/formationService';

function formatPrice(price, isFree) {
  if (isFree) return 'Gratuit';
  return `${price.toLocaleString()} FCFA`;
}

export default function MesFormations() {
  const navigation = useNavigation();
  const [formations, setFormations] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('enCours');

  const fetchData = useCallback(async () => {
    try {
      const [myFormations, myBadges] = await Promise.all([
        getMyFormations(),
        getMyBadges(),
      ]);
      setFormations(myFormations);
      setBadges(myBadges);
    } catch {
      setFormations([]);
      setBadges([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const enCours = formations.filter(f => !f.completedAt);
  const terminees = formations.filter(f => f.completedAt);

  const renderFormation = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('FormationDetail', { formationId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.statusBadge, item.completedAt ? styles.statusDone : styles.statusProgress]}>
          <Text style={styles.statusText}>{item.completedAt ? 'Terminé' : `${item.progress}%`}</Text>
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.completedAt ? '#9C7C4F' : '#C19A6B' }]} />
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>{formatPrice(item.price, item.isFree)}</Text>
        <Text style={styles.cardDate}>
          {item.completedAt
            ? `Fini le ${new Date(item.completedAt).toLocaleDateString()}`
            : `Depuis le ${new Date(item.enrolledAt).toLocaleDateString()}`
          }
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderBadge = ({ item }) => (
    <View style={styles.badgeCard}>
      <View style={styles.badgeIcon}>
        <FontAwesomeIcon icon={faMedal} style={{ fontSize: 26 }} color="#D9A441" />
      </View>
      <Text style={styles.badgeTitle} numberOfLines={2}>{item.label}</Text>
      <Text style={styles.badgeDate}>
        {new Date(item.earnedAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Formations</Text>
        <Text style={styles.headerSubtitle}>Suivez votre progression</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'enCours' && styles.tabActive]}
          onPress={() => setTab('enCours')}
        >
          <Text style={[styles.tabText, tab === 'enCours' && styles.tabTextActive]}>
            En cours ({enCours.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'terminees' && styles.tabActive]}
          onPress={() => setTab('terminees')}
        >
          <Text style={[styles.tabText, tab === 'terminees' && styles.tabTextActive]}>
            Terminées ({terminees.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'badges' && styles.tabActive]}
          onPress={() => setTab('badges')}
        >
          <Text style={[styles.tabText, tab === 'badges' && styles.tabTextActive]}>
            Badges ({badges.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#C19A6B" style={styles.loader} />
      ) : tab === 'badges' ? (
        <FlatList
          data={badges}
          keyExtractor={(item, idx) => `${item.formationId}-${idx}`}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C19A6B" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <FontAwesomeIcon icon={faMedal} style={{ fontSize: 32 }} color="#D9A441" />
              </View>
              <Text style={styles.emptyTitle}>Aucun badge</Text>
              <Text style={styles.emptyText}>Terminez une formation pour gagner un badge</Text>
            </View>
          }
          renderItem={renderBadge}
        />
      ) : (
        <FlatList
          data={tab === 'enCours' ? enCours : terminees}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C19A6B" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <FontAwesomeIcon icon={tab === 'enCours' ? faBookOpen : faTrophy} style={{ fontSize: 30 }} color="#C19A6B" />
              </View>
              <Text style={styles.emptyTitle}>
                {tab === 'enCours' ? 'Aucune formation en cours' : 'Aucune formation terminée'}
              </Text>
              <Text style={styles.emptyText}>
                {tab === 'enCours' ? 'Inscrivez-vous à une formation pour commencer' : 'Complétez une formation pour la voir ici'}
              </Text>
            </View>
          }
          renderItem={renderFormation}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F1E5',
  },
  header: {
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 26,
    fontWeight: '700',
    color: '#2E2A24',
  },
  headerSubtitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#7A7166',
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F2E7D3',
    borderRadius: 999,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#2E2A24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tabText: {
    fontFamily: 'CenturyGothic',
    fontSize: 12.5,
    color: '#A89E90',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#9C7C4F',
    fontWeight: '700',
  },
  loader: {
    marginTop: 40,
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  grid: {
    padding: 16,
    paddingBottom: 24,
  },
  gridRow: {
    gap: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0E6D6',
    shadowColor: '#2E2A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: '#2E2A24',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusProgress: {
    backgroundColor: 'rgba(193,154,107,0.16)',
  },
  statusDone: {
    backgroundColor: 'rgba(110,139,91,0.18)',
  },
  statusText: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    fontWeight: '700',
    color: '#9C7C4F',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#EFE3CD',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#9C7C4F',
    fontWeight: '700',
  },
  cardDate: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#A89E90',
  },
  badgeCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0E6D6',
    shadowColor: '#2E2A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(217,164,65,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    fontWeight: '600',
    color: '#2E2A24',
    textAlign: 'center',
    marginBottom: 6,
  },
  badgeDate: {
    fontFamily: 'CenturyGothic',
    fontSize: 10,
    color: '#A89E90',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(193,154,107,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: '#2E2A24',
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#A89E90',
    textAlign: 'center',
  },
});
