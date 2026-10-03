import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faSatellite } from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../constants/colors';
import { styles } from '../styles/CarteInteractive.styles';

const TILE_TYPES = [
  { id: 'standard', label: 'Plan', icon: faMap },
  { id: 'satellite', label: 'Satellite', icon: faSatellite },
];

export default function MapOptions({ mapType, onToggle }) {
  return (
    <View style={styles.mapOptions}>
      {TILE_TYPES.map((t, i) => {
        const active = mapType === t.id;
        return (
          <React.Fragment key={t.id}>
            {i > 0 && <View style={styles.optionDivider} />}
            <TouchableOpacity
              onPress={() => onToggle(t.id)}
              style={[styles.optionBtn, active && styles.optionBtnActive]}
              accessibilityLabel={t.label}
            >
              <FontAwesomeIcon
                icon={t.icon}
                color={active ? COLORS.primary : COLORS.textSecondary}
                style={{ fontSize: 17 }}
              />
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
}
