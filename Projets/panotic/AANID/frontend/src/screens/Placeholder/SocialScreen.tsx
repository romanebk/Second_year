import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONT_FAMILY } from '../../constants/theme';

export default function SocialScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        renderItem={() => null}
        contentContainerStyle={styles.empty}
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <View style={styles.iconCircle}>
              <FontAwesomeIcon icon={faComments} size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Fil d'actualité</Text>
            <Text style={styles.emptyDesc}>Les publications de la communauté apparaîtront ici.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyContent: { alignItems: 'center' },
  iconCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: COLORS.chipBg, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8, fontFamily: FONT_FAMILY },
  emptyDesc: { fontSize: 14, color: COLORS.textTertiary, textAlign: 'center', fontFamily: FONT_FAMILY },
});
