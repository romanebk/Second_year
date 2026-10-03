import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../constants/colors';
import { SIGNALEMENT_TYPES, PANEL_STATUSES } from '../constants/mapData';
import { styles } from '../styles/CarteInteractive.styles';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function getSignalementColor(type) {
  const found = SIGNALEMENT_TYPES.find(t => t.value === type);
  return found ? found.color : COLORS.primary;
}

function getPanelColor(etat) {
  const found = PANEL_STATUSES.find(s => s.value === etat);
  return found ? found.color : COLORS.primary;
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SignalementDetail({ item }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.modalTitle}>Signalement</Text>
      <View style={[styles.modalBadge, { backgroundColor: getSignalementColor(item.type) }]}>
        <Text style={styles.modalBadgeText}>{item.type?.replace('_', ' ')}</Text>
      </View>
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.modalImage} />}
      <InfoRow label="Description" value={item.description} />
      <InfoRow label="Statut" value={item.status} />
      <InfoRow label="Votes" value={String(item.votesCount ?? 0)} />
      <InfoRow label="Date" value={formatDate(item.createdAt)} />
      <TouchableOpacity style={styles.modalBtn}>
        <Text style={styles.modalBtnText}>Soutenir ce signalement</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function PanneauDetail({ item }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.modalTitle}>Panneau publicitaire</Text>
      <View style={[styles.modalBadge, { backgroundColor: getPanelColor(item.etat) }]}>
        <Text style={styles.modalBadgeText}>{item.type} · {item.etat}</Text>
      </View>
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.modalImage} />}
      <InfoRow label="Format" value={item.format} />
      <InfoRow label="Régime" value={item.regime} />
      <InfoRow label="État" value={item.etat} />
      {item.price ? <InfoRow label="Prix" value={`${item.price.toLocaleString()} FCFA`} /> : null}
      <TouchableOpacity style={styles.modalBtn}>
        <Text style={styles.modalBtnText}>
          {item.etat === 'DISPONIBLE' ? 'Réserver ce panneau' : 'Voir la disponibilité'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ZoneDetail({ item }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.modalTitle}>Zone</Text>
      <View style={[styles.modalBadge, { backgroundColor: COLORS.primary }]}>
        <Text style={styles.modalBadgeText}>{item.type}</Text>
      </View>
      <InfoRow label="Nom" value={item.name} />
      <InfoRow label="Type" value={item.type} />
    </ScrollView>
  );
}

export default function DetailModal({ item, onClose }) {
  return (
    <Modal visible={!!item} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <FontAwesomeIcon icon={faXmark} color={COLORS.textSecondary} style={{ fontSize: 15 }} />
          </TouchableOpacity>
          {item?.type === 'signalement' && <SignalementDetail item={item} />}
          {item?.type === 'panneau' && <PanneauDetail item={item} />}
          {item?.type === 'zone' && <ZoneDetail item={item} />}
        </View>
      </View>
    </Modal>
  );
}
