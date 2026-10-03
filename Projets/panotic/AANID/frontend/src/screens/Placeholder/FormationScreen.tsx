import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS } from '../../constants/theme';

export default function FormationScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        renderItem={() => null}
        contentContainerStyle={styles.empty}
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Icon name="graduation-cap" size={54} color={COLORS.primaryDark} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>Formations</Text>
            <Text style={styles.emptyDesc}>Catalogue des formations disponibles.</Text>
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
  emptyIcon: { marginBottom: 16, opacity: 0.5 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: COLORS.textTertiary, textAlign: 'center' },
});
