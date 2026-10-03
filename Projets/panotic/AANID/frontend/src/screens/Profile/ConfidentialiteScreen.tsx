import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Switch } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPen, faKey, faBell, faLocationDot, faShieldHalved, faTrash, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_FAMILY } from '../../constants/theme';

const ACCOUNT = [
  { icon: faUserPen, label: 'Données personnelles', desc: 'Gérer mes informations' },
  { icon: faKey, label: 'Mot de passe & sécurité', desc: 'Changer mon mot de passe' },
];

export default function ConfidentialiteScreen() {
  const [notifications, setNotifications] = useState(true);
  const [geoloc, setGeoloc] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const TOGGLES = [
    { icon: faBell, label: 'Notifications', desc: 'Recevoir les alertes', value: notifications, set: setNotifications },
    { icon: faLocationDot, label: 'Géolocalisation', desc: 'Partager ma position', value: geoloc, set: setGeoloc },
    { icon: faShieldHalved, label: 'Données d\'usage', desc: 'Aider à améliorer l\'app', value: analytics, set: setAnalytics },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Confidentialité</Text>
        <Text style={styles.desc}>Gérez vos données, votre sécurité et vos préférences.</Text>

        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.card}>
          {ACCOUNT.map((item, i) => (
            <TouchableOpacity key={i} style={[styles.item, i < ACCOUNT.length - 1 && styles.itemBorder]} activeOpacity={0.7}>
              <View style={styles.iconBg}>
                <FontAwesomeIcon icon={item.icon} size={16} color={COLORS.primary} />
              </View>
              <View style={styles.content}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
              <FontAwesomeIcon icon={faChevronRight} size={13} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.card}>
          {TOGGLES.map((item, i) => (
            <View key={i} style={[styles.item, i < TOGGLES.length - 1 && styles.itemBorder]}>
              <View style={styles.iconBg}>
                <FontAwesomeIcon icon={item.icon} size={16} color={COLORS.primary} />
              </View>
              <View style={styles.content}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.set}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={item.value ? COLORS.primary : '#FFFFFF'}
              />
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: COLORS.error }]}>Zone de danger</Text>
        <TouchableOpacity style={styles.dangerCard} activeOpacity={0.8}>
          <View style={[styles.iconBg, { backgroundColor: COLORS.error + '18' }]}>
            <FontAwesomeIcon icon={faTrash} size={16} color={COLORS.error} />
          </View>
          <View style={styles.content}>
            <Text style={[styles.label, { color: COLORS.error }]}>Supprimer mon compte</Text>
            <Text style={styles.itemDesc}>Suppression définitive et irréversible</Text>
          </View>
          <FontAwesomeIcon icon={faChevronRight} size={13} color={COLORS.error} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 6, fontFamily: FONT_FAMILY },
  desc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 22, fontFamily: FONT_FAMILY },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: COLORS.textTertiary, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 10, marginLeft: 4, marginTop: 22, fontFamily: FONT_FAMILY,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1, borderColor: '#F0E6D6',
    shadowColor: COLORS.shadow, shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2,
    overflow: 'hidden',
  },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: '#F4ECDD' },
  iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.chipBg },
  content: { flex: 1, marginLeft: 14 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.text, fontFamily: FONT_FAMILY },
  itemDesc: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2, fontFamily: FONT_FAMILY },
  dangerCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    padding: 16, borderRadius: 18, borderWidth: 1, borderColor: COLORS.error + '33',
  },
});
