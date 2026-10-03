import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope, faPhone, faComments, faChevronRight, faChevronDown, faChevronUp, faHeadset,
} from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_FAMILY } from '../../constants/theme';

const FAQ = [
  { q: 'Comment signaler un problème ?', a: 'Utilisez l\'onglet "Carte" puis touchez le bouton de signalement pour décrire le panneau concerné.' },
  { q: 'Comment sont attribués les points ?', a: 'Chaque signalement validé par la communauté ou la régie vous rapporte des points d\'engagement.' },
  { q: 'Puis-je modifier mon profil ?', a: 'Oui, allez dans Profil puis touchez le bouton crayon sur votre photo pour modifier vos informations.' },
  { q: 'Comment contacter le support ?', a: 'Vous pouvez nous écrire par email, nous appeler ou démarrer un chat depuis la section Contact ci-dessous.' },
];

const CONTACTS = [
  { icon: faEnvelope, label: 'Email', value: 'support@aanid.com', action: () => Linking.openURL('mailto:support@aanid.com') },
  { icon: faPhone, label: 'Téléphone', value: '+229 01 00 00 00', action: () => Linking.openURL('tel:+22901000000') },
  { icon: faComments, label: 'Chat en direct', value: 'Lun–Ven, 9h–18h', action: () => {} },
];

export default function AideSupportScreen() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <FontAwesomeIcon icon={faHeadset} size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Comment pouvons-nous aider ?</Text>
          <Text style={styles.desc}>Consultez la FAQ ou contactez notre équipe.</Text>
        </View>

        <Text style={styles.sectionTitle}>Questions fréquentes</Text>
        <View style={styles.card}>
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <View key={i} style={[i < FAQ.length - 1 && styles.faqBorder]}>
                <TouchableOpacity style={styles.faqHeader} activeOpacity={0.7} onPress={() => setOpen(isOpen ? null : i)}>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} size={13} color={COLORS.textTertiary} />
                </TouchableOpacity>
                {isOpen && <Text style={styles.faqAnswer}>{item.a}</Text>}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.card}>
          {CONTACTS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.contactItem, i < CONTACTS.length - 1 && styles.faqBorder]}
              activeOpacity={0.7}
              onPress={item.action}
            >
              <View style={styles.iconBg}>
                <FontAwesomeIcon icon={item.icon} size={16} color={COLORS.primary} />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>{item.label}</Text>
                <Text style={styles.contactValue}>{item.value}</Text>
              </View>
              <FontAwesomeIcon icon={faChevronRight} size={13} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 8 },
  heroIcon: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.chipBg,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 6, fontFamily: FONT_FAMILY },
  desc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, textAlign: 'center', fontFamily: FONT_FAMILY },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: COLORS.textTertiary, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 10, marginLeft: 4, marginTop: 26, fontFamily: FONT_FAMILY,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1, borderColor: '#F0E6D6',
    shadowColor: COLORS.shadow, shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2,
    overflow: 'hidden',
  },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: '#F4ECDD' },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1, fontFamily: FONT_FAMILY },
  faqAnswer: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, paddingHorizontal: 16, paddingBottom: 16, marginTop: -4, fontFamily: FONT_FAMILY },
  contactItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.chipBg },
  contactContent: { flex: 1, marginLeft: 14 },
  contactLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text, fontFamily: FONT_FAMILY },
  contactValue: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2, fontFamily: FONT_FAMILY },
});
