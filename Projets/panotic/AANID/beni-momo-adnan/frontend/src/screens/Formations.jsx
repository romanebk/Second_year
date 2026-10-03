import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faClock, faUsers } from '@fortawesome/free-solid-svg-icons';
import { getFormationsPaginated } from '../services/formationService';

const CATEGORIES = [
  { label: 'Toutes', value: 'toutes', color: '#7A7166' },
  { label: 'Panneautique', value: 'PANNEAUTIQUE', color: '#C19A6B' },
  { label: 'Environnement', value: 'ENVIRONNEMENT', color: '#B08C5E' },
  { label: 'Santé', value: 'SANTE', color: '#9C7C4F' },
  { label: 'Infrastructure', value: 'INFRASTRUCTURE', color: '#6E5333' },
];

function formatPrice(price, isFree) {
  if (isFree) return 'Gratuit';
  return `${price.toLocaleString()} FCFA`;
}

const PAGE_LIMIT = 4;

export default function Formations() {
  const navigation = useNavigation();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState('toutes');
  const [loadError, setLoadError] = useState(null);

  const fetchPage = useCallback(async (cat, pageNum, append = false) => {
    try {
      setLoadError(null);
      const result = await getFormationsPaginated(pageNum, PAGE_LIMIT, cat);
      if (append) {
        setFormations(prev => [...prev, ...result.data]);
      } else {
        setFormations(result.data);
      }
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      if (!append) setFormations([]);
      setLoadError(err?.message || 'Impossible de charger les formations');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    fetchPage(activeCategory, 1, false);
  }, [activeCategory, fetchPage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchPage(activeCategory, 1, false);
  }, [activeCategory, fetchPage]);

  const onEndReached = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      fetchPage(activeCategory, page + 1, true);
    }
  }, [loadingMore, hasMore, loading, activeCategory, page, fetchPage]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Formations</Text>
        <Text style={styles.headerSubtitle}>Développez vos compétences</Text>
      </View>

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeCategory === item.value && { backgroundColor: item.color },
              ]}
              onPress={() => setActiveCategory(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeCategory === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#C19A6B" style={styles.loader} />
      ) : (
        <FlatList
          data={formations}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C19A6B" />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#C19A6B" style={styles.loaderMore} />
            ) : null
          }
          ListEmptyComponent={
            loadError ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{loadError}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
                  <Text style={styles.retryBtnText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.empty}>
                <View style={styles.emptyIconWrap}>
                  <FontAwesomeIcon icon={faGraduationCap} style={{ fontSize: 34 }} color="#C19A6B" />
                </View>
                <Text style={styles.emptyText}>Aucune formation trouvée</Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('FormationDetail', { formationId: item.id })}
            >
              <View style={[styles.cardBadge, { backgroundColor: (CATEGORIES.find(c => c.value === item.category)?.color || '#C19A6B') + '22' }]}>
                <Text style={[styles.cardBadgeText, { color: CATEGORIES.find(c => c.value === item.category)?.color || '#9C7C4F' }]}>{item.category}</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.cardMetaRow}>
                <FontAwesomeIcon icon={faClock} style={{ fontSize: 11 }} color="#A89E90" />
                <Text style={styles.cardMeta}>{item.duration}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>{formatPrice(item.price, item.isFree)}</Text>
                <View style={styles.cardEnrolledRow}>
                  <FontAwesomeIcon icon={faUsers} style={{ fontSize: 10 }} color="#A89E90" />
                  <Text style={styles.cardEnrolled}>{item.enrolledCount}/{item.capacity}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
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
  filterRow: {
    paddingVertical: 10,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  filterChipText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#7A7166',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  loader: {
    marginTop: 40,
  },
  loaderMore: {
    paddingVertical: 20,
  },
  grid: {
    padding: 16,
    paddingBottom: 24,
  },
  gridRow: {
    gap: 14,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0E6D6',
    shadowColor: '#2E2A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  cardBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  cardBadgeText: {
    fontFamily: 'CenturyGothic',
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: '#2E2A24',
    marginBottom: 8,
    lineHeight: 18,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  cardMeta: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#7A7166',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0E6D6',
    paddingTop: 10,
  },
  cardPrice: {
    fontFamily: 'CenturyGothic',
    fontSize: 12.5,
    color: '#9C7C4F',
    fontWeight: '700',
  },
  cardEnrolledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardEnrolled: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: '#A89E90',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
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
  emptyText: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    color: '#A89E90',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#C19A6B',
  },
  retryBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
