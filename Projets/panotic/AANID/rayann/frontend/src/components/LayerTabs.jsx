import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTriangleExclamation, faRectangleAd, faLayerGroup, faFire, faChartColumn,
} from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../constants/colors';
import { LAYERS } from '../constants/mapData';
import { styles } from '../styles/CarteInteractive.styles';

const LAYER_ICONS = {
  'alert-circle': faTriangleExclamation,
  grid: faRectangleAd,
  square: faLayerGroup,
  thermometer: faFire,
  'bar-chart': faChartColumn,
};

const TAB_LAYERS = LAYERS.filter((l) => l.id !== 'analyse');

export default function LayerTabs({ activeLayer, onSelect }) {
  return (
    <View style={styles.layerTabs}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.layerScroll}>
        {TAB_LAYERS.map((l) => {
          const active = activeLayer === l.id;
          return (
            <TouchableOpacity
              key={l.id}
              onPress={() => onSelect(l.id)}
              style={[styles.layerTab, active && styles.activeTab]}
            >
              <FontAwesomeIcon
                icon={LAYER_ICONS[l.icon] || faChartColumn}
                color={active ? COLORS.white : COLORS.textSecondary}
                style={{ fontSize: 13 }}
              />
              <Text style={[styles.tabText, active && styles.activeTabText]}>{l.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
