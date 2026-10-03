import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { getVilles } from '../services/villeService';

const COLORS = {
  primary: '#C19A6B',
  primaryDark: '#0A1628',
  background: '#FAF6F0',
  surface: '#FFFFFF',
  text: '#2D2A26',
  textSecondary: '#7A7166',
  border: '#E8DCC8',
  accent: '#F5A623',
  success: '#3BB273',
  danger: '#E94E3C',
};

function StatPill({ label, value, color }) {
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

function VilleCard({ ville, onContact }) {
  const panneaux = ville.stats?.panneaux || {};
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.dot, { backgroundColor: ville.couleur || COLORS.accent }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{ville.nom}</Text>
          <Text style={styles.cardSubtitle}>{ville.region ? `${ville.region} · ` : ''}{ville.pays}</Text>
        </View>
      </View>

      <View style={styles.pillRow}>
        <StatPill label="Disponibles" value={panneaux.disponibles ?? 0} color={COLORS.success} />
        <StatPill label="Loués" value={panneaux.loues ?? 0} color={COLORS.accent} />
        <StatPill label="Maintenance" value={panneaux.maintenance ?? 0} color={COLORS.danger} />
      </View>

      <TouchableOpacity
        style={styles.ctaBtn}
        activeOpacity={0.8}
        onPress={() => onContact(ville)}
      >
        <Text style={styles.ctaText}>Réserver un espace</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RelaisPublicitaire() {
  const [villes, setVilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getVilles();
      setVilles(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Impossible de charger les espaces publicitaires.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const onContact = useCallback((ville) => {
    Alert.alert(
      'Demande de réservation',
      `Pour réserver un espace publicitaire à ${ville.nom}, contactez notre équipe via l'onglet Social → Consultation. Un conseiller vous répondra sous 48h.`,
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={villes}
        keyExtractor={(v) => v.id}
        renderItem={({ item }) => <VilleCard ville={item} onContact={onContact} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Relais Publicitaire</Text>
            <Text style={styles.headerDesc}>
              Panneaux et espaces publicitaires disponibles par ville. Sélectionnez une ville pour réserver.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>{error || 'Aucun espace disponible pour le moment.'}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  list: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  headerDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, lineHeight: 19 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  cardSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  pillValue: { fontSize: 18, fontWeight: '800' },
  pillLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2 },
  ctaBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
