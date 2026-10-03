import React, { useMemo } from 'react';
import LeafletNativeMap from './LeafletNativeMap';
import {
  getSignalementColor,
  getPanelColor,
  getZoneFillColor,
  getZoneStrokeColor,
  formatDate,
} from './mapMarkerHelpers';
import { styles } from '../styles/CarteInteractive.styles';

export default function MapMarkers({
  mapRef, mapType, activeLayer,
  signalements, panneaux, zones, heatmapPoints,
  onSelectItem, selectedId,
}) {
  const mapHelpers = useMemo(() => ({
    getSignalementColor,
    getPanelColor,
    getZoneFillColor,
    getZoneStrokeColor,
    formatDate,
  }), []);

  return (
    <LeafletNativeMap
      ref={mapRef}
      style={styles.map}
      mapType={mapType}
      activeLayer={activeLayer}
      signalements={signalements}
      panneaux={panneaux}
      zones={zones}
      heatmapPoints={heatmapPoints}
      onSelectItem={onSelectItem}
      selectedId={selectedId}
      helpers={mapHelpers}
    />
  );
}
