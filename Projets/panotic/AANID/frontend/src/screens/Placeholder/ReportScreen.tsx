import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function ReportScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.body}>
      <Text style={styles.title}>Signaler un problème</Text>
      <Text style={styles.desc}>Décrivez le problème que vous avez constaté.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.chipRow}>
          {['Panneau', 'Éclairage', 'Route', 'Autre'].map((t) => (
            <TouchableOpacity key={t} style={styles.chip}><Text style={styles.chipText}>{t}</Text></TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.textArea} placeholder="Décrivez le problème..." placeholderTextColor={COLORS.textTertiary} multiline numberOfLines={5} />
      </View>

      <TouchableOpacity style={styles.submitBtn}>
        <Text style={styles.submitText}>Envoyer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  body: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  desc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  textArea: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, textAlignVertical: 'top', minHeight: 120 },
  submitBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
