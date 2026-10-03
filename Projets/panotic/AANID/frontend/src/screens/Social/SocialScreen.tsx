import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useSelector } from 'react-redux';
import PostsReseaux from '@aanid/undef-frontend/src/screens/PostsReseaux';
import Consultation from '@aanid/undef-frontend/src/screens/Consultation';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { COLORS, FONT_FAMILY } from '../../constants/theme';

const SECTIONS = [
  { key: 'fil', label: "Fil d'actualité", icon: 'newspaper' },
  { key: 'consultation', label: 'Consultation', icon: 'comments' },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

export default function SocialScreen() {
  const [section, setSection] = useState<SectionKey>('fil');
  const user = useSelector(selectCurrentUser);
  const author = `@${(user?.firstName || user?.fullName || 'Citoyen').split(' ')[0]}`;

  return (
    <View style={styles.container}>
      <View style={styles.segmentRow}>
        {SECTIONS.map(({ key, label, icon }) => {
          const active = section === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.segment, active && styles.segmentActive]}
              onPress={() => setSection(key)}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Icon name={icon} size={14} color={active ? COLORS.white : COLORS.primaryDark} solid={active} />
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.content}>
        {section === 'fil' ? <PostsReseaux author={author} /> : <Consultation />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  segmentText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, fontFamily: FONT_FAMILY },
  segmentTextActive: { color: COLORS.white },
  content: { flex: 1 },
});
