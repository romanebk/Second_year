import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../constants/colors';

const { height } = Dimensions.get('window');

const styles = {
  modalBg: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'CenturyGothic',
  },
  closeBtn: {
    padding: 5,
  },
  closeText: {
    fontSize: 22,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  villeName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    fontFamily: 'CenturyGothic',
  },
  section: {
    marginBottom: 20,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: 'CenturyGothic',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'CenturyGothic',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'CenturyGothic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: 'CenturyGothic',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'CenturyGothic',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: 'CenturyGothic',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'CenturyGothic',
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'CenturyGothic',
  },
};

const TYPE_LABELS = {
  DEGRADE: 'Dégradé',
  DANGEREUX: 'Dangereux',
  ILLEGAL: 'Illégal',
  OBSOLETE: 'Obsolète',
  TRAVAUX: 'Travaux',
  BON_ETAT: 'Bon État',
  CLASSIQUE: 'Classique',
  DIGITAL: 'Digital',
  ABRIBUS: 'Abribus',
  TOTEM: 'Totem',
  AUTRE: 'Autre',
  DISPONIBLE: 'Disponible',
  LOUE: 'Loué',
  MAINTENANCE: 'Maintenance',
  PENDING: 'En attente',
  VALIDATED: 'Validé',
  RESOLVED: 'Résolu',
  REJECTED: 'Rejeté',
  commerciale: 'Commerciale',
  residentielle: 'Résidentielle',
  speciale: 'Spéciale',
  interdite: 'Interdite',
};

const TYPE_COLORS = {
  DEGRADE: '#F5A623',
  DANGEREUX: '#E94E3C',
  ILLEGAL: '#E94E3C',
  OBSOLETE: '#BDBDBD',
  TRAVAUX: '#1E73BE',
  BON_ETAT: '#3BB273',
  CLASSIQUE: '#1E73BE',
  DIGITAL: '#4A90D9',
  ABRIBUS: '#3BB273',
  TOTEM: '#F5A623',
  AUTRE: '#BDBDBD',
  DISPONIBLE: '#3BB273',
  LOUE: '#F5A623',
  MAINTENANCE: '#E94E3C',
};

export default function AnalyseVille({ visible, villeId, villes, apiGet, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) fetchStats();
  }, [visible, villeId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const villeParam = villeId !== 'toutes' ? `?villeId=${villeId}` : '';
      const data = await apiGet(`/carte/stats${villeParam}`);
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  const currentVille = villes.find(v => v.id === villeId);

  const renderProgressBar = (value, max, color) => (
    <View style={[styles.confidenceBar, { backgroundColor: COLORS.border, overflow: 'hidden' }]}>
      <View style={[styles.confidenceBar, { width: max > 0 ? `${(value / max) * 100}%` : '0%', backgroundColor: color || COLORS.primary }]} />
    </View>
  );

  const renderStatSection = (title, data, totalKey) => {
    if (!data) return null;
    const entries = Object.entries(data);
    const total = totalKey || entries.reduce((sum, [, v]) => sum + (typeof v === 'number' ? v : 0), 0);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {entries.map(([key, value]) => (
          typeof value === 'number' && (
            <View key={key} style={styles.statRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.legendDot, { backgroundColor: TYPE_COLORS[key] || COLORS.primary }]} />
                <Text style={styles.statLabel}>{TYPE_LABELS[key] || key}</Text>
              </View>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          )
        ))}
        {renderProgressBar(total, total, COLORS.primary)}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBg}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Analyse de la zone</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <FontAwesomeIcon icon={faXmark} color={COLORS.textSecondary} style={{ fontSize: 18 }} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Analyse en cours...</Text>
            </View>
          ) : stats ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.villeName}>
                <FontAwesomeIcon icon={faLocationDot} color={COLORS.primary} style={{ fontSize: 13, marginRight: 6 }} />
                {' '}{stats.ville}
                {currentVille && ` (${currentVille.pays})`}
              </Text>

              {stats.tauxSignalement !== undefined && (
                <View style={[styles.section, { backgroundColor: COLORS.primary }]}>
                  <Text style={[styles.sectionTitle, { color: COLORS.white }]}>Indice de santé urbaine</Text>
                  <Text style={{ fontSize: 36, fontWeight: 'bold', color: COLORS.white, textAlign: 'center' }}>
                    {Math.round((1 - Math.min(1, stats.tauxSignalement / 2)) * 100)}%
                  </Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 5, fontFamily: 'CenturyGothic' }}>
                    {stats.tauxSignalement > 0.5
                      ? 'Nécessite une intervention'
                      : stats.tauxSignalement > 0.2
                        ? 'Attention modérée requise'
                        : 'Bonne santé urbaine'}
                  </Text>
                </View>
              )}

              {renderStatSection('Signalements par type', stats.signalements?.parType)}
              {renderStatSection('Signalements par statut', stats.signalements?.parStatut)}
              {renderStatSection('Panneaux par type', stats.panneaux?.parType)}
              {renderStatSection('Panneaux par état', stats.panneaux?.parEtat)}

              {stats.panneaux?.prixMoyen > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Prix moyen</Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Location panneau</Text>
                    <Text style={styles.statValue}>{stats.panneaux.prixMoyen.toLocaleString()} FCFA</Text>
                  </View>
                </View>
              )}

              {renderStatSection('Zones', stats.zones?.parType)}

              <View style={{ height: 40 }} />
            </ScrollView>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Aucune donnée disponible</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
