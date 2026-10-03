import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard, faBell, faLock, faCircleQuestion,
  faRightFromBracket, faChevronRight, faGear, faPen,
  faTrophy, faFlag, faSeedling, faHouse,
} from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { COLORS, FONT_FAMILY } from '../../constants/theme';

const ACCESS_TOKEN_KEY = '@aanid/v1/access_token';
const REFRESH_TOKEN_KEY = '@aanid/v1/refresh_token';

export default function ProfileScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const initials = user?.email?.charAt(0).toUpperCase() || 'C';

  const handleLogout = async () => {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]).catch(() => {});
    dispatch(logout());
  };

  const MenuRow = ({ icon, color, label, desc, screen, last }: any) => (
    <TouchableOpacity
      style={[styles.menuItem, !last && styles.menuItemBorder]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate(screen)}
    >
      <View style={[styles.menuIcon, { backgroundColor: color + '1F' }]}>
        <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} color={color} />
      </View>
      <View style={styles.menuTextWrap}>
        <Text style={styles.menuText}>{label}</Text>
        <Text style={styles.menuDesc}>{desc}</Text>
      </View>
      <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 13 }} color={COLORS.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Main', { screen: 'Dashboard' })}>
            <FontAwesomeIcon icon={faHouse} style={{ fontSize: 15 }} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Profil</Text>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Confidentialite')}>
            <FontAwesomeIcon icon={faGear} style={{ fontSize: 16 }} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <TouchableOpacity style={styles.editAvatar} activeOpacity={0.8}>
            <FontAwesomeIcon icon={faPen} style={{ fontSize: 11 }} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{user?.firstName || 'Citoyen'}</Text>
        <Text style={styles.email}>{user?.email || 'citoyen@aanid.com'}</Text>

        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{user?.role || 'CITOYEN'}</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <FontAwesomeIcon icon={faFlag} style={{ fontSize: 14 }} color={COLORS.primary} />
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Signalements</Text>
          </View>
          <View style={[styles.stat, styles.statBordered]}>
            <FontAwesomeIcon icon={faSeedling} style={{ fontSize: 14 }} color={COLORS.primary} />
            <Text style={styles.statValue}>Niv. 1</Text>
            <Text style={styles.statLabel}>Engagement</Text>
          </View>
          <View style={[styles.stat, styles.statBordered]}>
            <FontAwesomeIcon icon={faTrophy} style={{ fontSize: 14 }} color={COLORS.primary} />
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Récompenses</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon compte</Text>
          <View style={styles.card}>
            <MenuRow icon={faCreditCard} color={COLORS.warning} label="Mon Abonnement" desc="Forfait & facturation" screen="Pricing" />
            <MenuRow icon={faBell} color={COLORS.primary} label="Notifications" desc="Alertes & rappels" screen="Notifications" last />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences & aide</Text>
          <View style={styles.card}>
            <MenuRow icon={faLock} color={COLORS.success} label="Confidentialité" desc="Données & sécurité" screen="Confidentialite" />
            <MenuRow icon={faCircleQuestion} color={COLORS.secondary} label="Aide & Support" desc="FAQ & contact" screen="AideSupport" last />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
          <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 16 }} color={COLORS.error} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        <Text style={styles.version}>AANID · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryDark, paddingTop: 40, paddingBottom: 24,
    alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', paddingHorizontal: 20, marginBottom: 8,
  },
  topTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700', fontFamily: FONT_FAMILY },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarWrap: { position: 'relative', marginBottom: 8 },
  avatar: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.32)',
  },
  avatarText: { color: COLORS.white, fontSize: 28, fontWeight: 'bold', fontFamily: FONT_FAMILY },
  editAvatar: {
    position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: COLORS.primaryDark,
  },
  name: { color: COLORS.white, fontSize: 19, fontWeight: '700', fontFamily: FONT_FAMILY },
  email: { color: 'rgba(255,255,255,0.7)', fontSize: 12.5, marginTop: 2, fontFamily: FONT_FAMILY },
  badge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, marginTop: 10,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primaryLight, marginRight: 7 },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700', letterSpacing: 0.6, fontFamily: FONT_FAMILY },

  body: { flex: 1 },
  bodyContent: { paddingBottom: 40 },
  statsCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: 20,
    marginTop: -22, borderRadius: 20, paddingVertical: 22, borderWidth: 1, borderColor: '#F0E6D6',
    shadowColor: COLORS.shadow, shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5,
  },
  stat: { flex: 1, alignItems: 'center', gap: 5 },
  statBordered: { borderLeftWidth: 1, borderLeftColor: COLORS.border },
  statValue: { fontSize: 17, fontWeight: '800', color: COLORS.text, fontFamily: FONT_FAMILY },
  statLabel: { fontSize: 9.5, color: COLORS.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, fontFamily: FONT_FAMILY },

  section: { paddingHorizontal: 20, marginTop: 26 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: COLORS.textTertiary, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 10, marginLeft: 4, fontFamily: FONT_FAMILY,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1, borderColor: '#F0E6D6',
    shadowColor: COLORS.shadow, shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F4ECDD' },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuTextWrap: { flex: 1, marginLeft: 14 },
  menuText: { fontSize: 15, fontWeight: '600', color: COLORS.text, fontFamily: FONT_FAMILY },
  menuDesc: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2, fontFamily: FONT_FAMILY },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.error + '12', marginHorizontal: 20, marginTop: 28,
    paddingVertical: 15, borderRadius: 16, borderWidth: 1, borderColor: COLORS.error + '33',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.error, fontFamily: FONT_FAMILY },
  version: { textAlign: 'center', fontSize: 11, color: COLORS.textTertiary, marginTop: 20, fontFamily: FONT_FAMILY },
});
