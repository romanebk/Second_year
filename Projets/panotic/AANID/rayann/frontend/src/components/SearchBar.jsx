import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass, faXmark, faLocationCrosshairs, faRectangleAd, faMap,
} from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../constants/colors';
import { styles } from '../styles/CarteInteractive.styles';

export default function SearchBar({
  query,
  onChange,
  onSubmit,
  onClear,
  onLocate,
  results,
  onResultPress,
  onZoneResultPress,
}) {
  const inputRef = useRef(null);

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchPill}>
        <Pressable style={styles.searchInputZone} onPress={() => inputRef.current?.focus()}>
          <FontAwesomeIcon icon={faMagnifyingGlass} color={COLORS.textTertiary} style={{ fontSize: 15, marginRight: 10 }} />
          <TextInput
            ref={inputRef}
            placeholder="Rechercher un panneau, une zone…"
            placeholderTextColor={COLORS.textTertiary}
            style={styles.searchInput}
            value={query}
            onChangeText={onChange}
            onSubmitEditing={onSubmit}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesomeIcon icon={faXmark} color={COLORS.textTertiary} style={{ fontSize: 16 }} />
            </TouchableOpacity>
          )}
        </Pressable>
        <View style={styles.searchDivider} />
        <TouchableOpacity style={styles.gpsBtn} onPress={onLocate} accessibilityLabel="Centrer sur ma position">
          <FontAwesomeIcon icon={faLocationCrosshairs} color={COLORS.white} style={{ fontSize: 17 }} />
        </TouchableOpacity>
      </View>
      {results && renderResults(results, onResultPress, onZoneResultPress)}
    </View>
  );
}

function renderResults(results, onResultPress, onZoneResultPress) {
  const hasPanels = results.panneaux && results.panneaux.length > 0;
  const hasZones = results.zones && results.zones.length > 0;
  if (!hasPanels && !hasZones) {
    return (
      <View style={styles.searchResults}>
        <Text style={styles.emptyFilterText}>Aucun résultat trouvé</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
      {hasPanels && results.panneaux.map((p, i) => (
        <TouchableOpacity
          key={`p-${i}`}
          style={styles.searchResultItem}
          onPress={() => onResultPress(p.lat, p.lng)}
        >
          <FontAwesomeIcon icon={faRectangleAd} color={COLORS.primary} style={{ fontSize: 15, marginRight: 10 }} />
          <Text style={styles.searchResultText}>Panneau {p.type} · {p.format}</Text>
        </TouchableOpacity>
      ))}
      {hasZones && results.zones.map((z, i) => (
        <TouchableOpacity
          key={`z-${i}`}
          style={styles.searchResultItem}
          onPress={() => onZoneResultPress(z)}
        >
          <FontAwesomeIcon icon={faMap} color={COLORS.primary} style={{ fontSize: 15, marginRight: 10 }} />
          <Text style={styles.searchResultText}>{z.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
