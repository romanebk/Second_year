import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout, Polygon, UrlTile, Heatmap } from 'react-native-maps';
import MapView from 'react-native-map-clustering/lib/ClusteredMapView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../constants/colors';
import {
  INITIAL_REGION, TILE_URLS, SIGNALEMENT_ICONS, PANEL_ICONS,
} from '../constants/mapData';
import {
  getSignalementColor,
  getPanelColor,
  getZoneFillColor,
  getZoneStrokeColor,
  formatDate,
} from './mapMarkerHelpers';
import { styles } from '../styles/CarteInteractive.styles';

function PinGraphic({ color, icon, selected }) {
  const scale = selected ? 1.14 : 1;
  return (
    <View style={[pin.wrap, { transform: [{ scale }] }]}>
      <View style={[pin.head, { backgroundColor: color }]}>
        <View style={pin.inner}>
          <FontAwesomeIcon icon={icon} color={color} style={{ fontSize: 14 }} />
        </View>
      </View>
      <View style={[pin.tail, { borderTopColor: color }]} />
    </View>
  );
}

function renderSignalement(item, onSelect, selected) {
  const color = getSignalementColor(item.type);
  return (
    <Marker
      key={item.id}
      coordinate={{ latitude: item.lat, longitude: item.lng }}
      iconSize={[46, 56]}
      iconAnchor={[23, 52]}
      anchor={{ x: 0.5, y: 0.95 }}
      zIndexOffset={selected ? 1000 : 0}
    >
      <PinGraphic color={color} icon={SIGNALEMENT_ICONS[item.type] || faLocationDot} selected={selected} />
      <Callout tooltip onPress={() => onSelect({ type: 'signalement', ...item })}>
        <View style={styles.calloutCard}>
          <View style={[styles.calloutHeader, { backgroundColor: color }]}>
            <Text style={styles.calloutTitle}>{item.type.replace('_', ' ')}</Text>
          </View>
          <View style={styles.calloutBody}>
            <Text style={styles.calloutDesc} numberOfLines={3}>{item.description}</Text>
            <Text style={styles.calloutDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );
}

function renderPanneau(item, onSelect, selected) {
  const color = getPanelColor(item.etat);
  return (
    <Marker
      key={item.id}
      coordinate={{ latitude: item.lat, longitude: item.lng }}
      iconSize={[46, 56]}
      iconAnchor={[23, 52]}
      anchor={{ x: 0.5, y: 0.95 }}
      zIndexOffset={selected ? 1000 : 0}
    >
      <PinGraphic color={color} icon={PANEL_ICONS[item.type] || faLocationDot} selected={selected} />
      <Callout tooltip onPress={() => onSelect({ type: 'panneau', ...item })}>
        <View style={styles.calloutCard}>
          <View style={[styles.calloutHeader, { backgroundColor: color }]}>
            <Text style={styles.calloutTitle}>{item.type}</Text>
          </View>
          <View style={styles.calloutBody}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { width: 60 }]}>Format:</Text>
              <Text style={styles.infoValue}>{item.format}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { width: 60 }]}>Régime:</Text>
              <Text style={styles.infoValue}>{item.regime}</Text>
            </View>
            <Text style={styles.calloutDate}>{item.etat}</Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );
}

function renderZone(item, onPress) {
  return (
    <Polygon
      key={item.id}
      coordinates={(item.boundary?.coordinates?.[0] || []).map((c) => ({
        latitude: c[1],
        longitude: c[0],
      }))}
      fillColor={getZoneFillColor(item.type)}
      strokeColor={getZoneStrokeColor(item.type)}
      strokeWidth={2}
      tappable
      onPress={() => onPress({ type: 'zone', ...item })}
    />
  );
}

export default function MapMarkers({
  mapRef, mapType, activeLayer,
  signalements, panneaux, zones, heatmapPoints,
  onSelectItem, selectedId,
}) {
  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      mapType="none"
      initialRegion={INITIAL_REGION}
      clusterColor={COLORS.primary}
    >
      <UrlTile
        urlTemplate={TILE_URLS[mapType] || TILE_URLS.standard}
        maximumZ={19}
        tileSize={256}
      />
      {activeLayer === 'signalements' && signalements.map((item) => (
        renderSignalement(item, onSelectItem, selectedId === item.id)
      ))}
      {activeLayer === 'panneaux' && panneaux.map((item) => (
        renderPanneau(item, onSelectItem, selectedId === item.id)
      ))}
      {activeLayer === 'zones' && zones.map((item) => (
        renderZone(item, onSelectItem)
      ))}
      {activeLayer === 'heatmap' && heatmapPoints.length > 0 && (
        <Heatmap points={heatmapPoints} radius={40} opacity={0.6} />
      )}
    </MapView>
  );
}

const pin = StyleSheet.create({
  wrap: {
    width: 46,
    height: 56,
    alignItems: 'center',
  },
  head: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 6,
  },
  inner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tail: {
    marginTop: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
