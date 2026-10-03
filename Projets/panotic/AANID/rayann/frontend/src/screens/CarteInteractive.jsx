import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faChevronDown, faChartColumn } from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../constants/colors';
import { API_BASE, INITIAL_REGION } from '../constants/mapData';
import { styles } from '../styles/CarteInteractive.styles';
import SearchBar from '../components/SearchBar';
import LayerTabs from '../components/LayerTabs';
import MapMarkers from '../components/MapMarkers';
import FilterBar from '../components/FilterBar';
import MapOptions from '../components/MapOptions';
import DetailModal from '../components/DetailModal';
import VilleSelector from '../components/VilleSelector';
import AnalyseVille from '../components/AnalyseVille';

const LAYER_META = {
  signalements: { title: 'Signalements', key: 'signalements' },
  panneaux: { title: 'Panneaux', key: 'panneaux' },
  zones: { title: 'Zones', key: 'zones' },
  heatmap: { title: 'Carte de chaleur', key: 'heatmap' },
};

export default function CarteInteractive() {
  const isFocused = useIsFocused();
  const mapRef = useRef(null);
  const [signalements, setSignalements] = useState([]);
  const [panneaux, setPanneaux] = useState([]);
  const [zones, setZones] = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [villes, setVilles] = useState([]);
  const [selectedVille, setSelectedVille] = useState('toutes');
  const [showVilleSelector, setShowVilleSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [activeLayer, setActiveLayer] = useState('signalements');
  const [mapType, setMapType] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [sigFilter, setSigFilter] = useState('tous');
  const [panelTypeFilter, setPanelTypeFilter] = useState('tous');
  const [panelStatusFilter, setPanelStatusFilter] = useState('tous');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAnalyse, setShowAnalyse] = useState(false);

  useEffect(() => {
    fetchVilles();
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }
    } catch (e) {}
  };

  const apiGet = async (path) => {
    try {
      const response = await fetch(`${API_BASE}${path}`);
      return await response.json();
    } catch (error) {
      console.warn('API error:', path, error.message);
      return [];
    }
  };

  const fetchVilles = async () => {
    const data = await apiGet('/carte/villes');
    setVilles(Array.isArray(data) ? data : []);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const villeParam = selectedVille !== 'toutes' ? `&villeId=${selectedVille}` : '';
      switch (activeLayer) {
        case 'signalements': {
          const data = await apiGet(`/carte/signalements?type=${sigFilter}${villeParam}`);
          setSignalements(Array.isArray(data) ? data : []);
          break;
        }
        case 'panneaux': {
          const data = await apiGet(`/carte/panneaux?type=${panelTypeFilter}&etat=${panelStatusFilter}${villeParam}`);
          setPanneaux(Array.isArray(data) ? data : []);
          break;
        }
        case 'zones': {
          const data = await apiGet(`/carte/zones${villeParam ? `?${villeParam.slice(1)}` : ''}`);
          setZones(Array.isArray(data) ? data : []);
          break;
        }
        case 'heatmap': {
          const data = await apiGet(`/carte/heatmap${villeParam ? `?${villeParam.slice(1)}` : ''}`);
          setHeatmapPoints(Array.isArray(data) ? data : []);
          break;
        }
      }
    } finally {
      setLoading(false);
    }
  }, [activeLayer, sigFilter, panelTypeFilter, panelStatusFilter, selectedVille]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const performSearch = async () => {
    if (searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    const villeParam = selectedVille !== 'toutes' ? `&villeId=${selectedVille}` : '';
    const data = await apiGet(`/carte/recherche?q=${encodeURIComponent(searchQuery)}${villeParam}`);
    setSearchResults(data);
    setLoading(false);
  };

  const centerOnCoordinate = (lat, lng, delta = 0.02) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: delta,
        longitudeDelta: delta,
      }, 900);
    }
    setSearchResults(null);
    setSearchQuery('');
  };

  const handleLocate = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => centerOnCoordinate(pos.coords.latitude, pos.coords.longitude, 0.03),
        () => centerOnCoordinate(INITIAL_REGION.latitude, INITIAL_REGION.longitude, INITIAL_REGION.latitudeDelta),
        { enableHighAccuracy: true, timeout: 5000 },
      );
    } else {
      centerOnCoordinate(INITIAL_REGION.latitude, INITIAL_REGION.longitude, INITIAL_REGION.latitudeDelta);
    }
  };

  const handleLayerSelect = (layerId) => {
    setActiveLayer(layerId);
    setSelectedItem(null);
  };

  useEffect(() => {
    if (selectedVille !== 'toutes') {
      const ville = villes.find(v => v.id === selectedVille);
      if (ville && ville.lat && ville.lng) {
        centerOnCoordinate(ville.lat, ville.lng, 0.06);
      }
    }
  }, [selectedVille, villes]);

  const counts = {
    signalements: signalements.length,
    panneaux: panneaux.length,
    zones: zones.length,
    heatmap: heatmapPoints.length,
  };
  const meta = LAYER_META[activeLayer] || LAYER_META.signalements;
  const selectedVilleLabel = selectedVille === 'toutes'
    ? 'Toutes les villes'
    : (villes.find(v => v.id === selectedVille)?.nom || selectedVille);

  return (
    <View style={styles.container}>
      {isFocused ? (
        <MapMarkers
          mapRef={mapRef}
          mapType={mapType}
          activeLayer={activeLayer}
          signalements={signalements}
          panneaux={panneaux}
          zones={zones}
          heatmapPoints={heatmapPoints}
          onSelectItem={setSelectedItem}
          selectedId={selectedItem?.id}
        />
      ) : (
        <View style={styles.map} />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingPill}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingPillText}>Chargement…</Text>
          </View>
        </View>
      )}

      <SearchBar
        query={searchQuery}
        onChange={setSearchQuery}
        onSubmit={performSearch}
        onClear={() => { setSearchQuery(''); setSearchResults(null); }}
        onLocate={handleLocate}
        results={searchResults}
        onResultPress={(lat, lng) => centerOnCoordinate(lat, lng)}
        onZoneResultPress={(z) => {
          if (z.boundary?.coordinates?.[0]?.[0]) {
            centerOnCoordinate(z.boundary.coordinates[0][0][1], z.boundary.coordinates[0][0][0]);
          }
        }}
      />

      <TouchableOpacity style={styles.villeBtn} onPress={() => setShowVilleSelector(true)}>
        <FontAwesomeIcon icon={faLocationDot} color={COLORS.primary} style={{ fontSize: 13 }} />
        <Text style={styles.villeBtnText} numberOfLines={1}>{selectedVilleLabel}</Text>
        <FontAwesomeIcon icon={faChevronDown} color={COLORS.textTertiary} style={{ fontSize: 10, marginLeft: 6 }} />
      </TouchableOpacity>

      <LayerTabs activeLayer={activeLayer} onSelect={handleLayerSelect} />
      <MapOptions mapType={mapType} onToggle={setMapType} />

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitleWrap}>
            <Text style={styles.sheetTitle}>{meta.title}</Text>
            <View style={styles.sheetCountBadge}>
              <Text style={styles.sheetCountText}>{counts[meta.key] ?? 0}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.sheetAnalyseBtn} onPress={() => setShowAnalyse(true)}>
            <FontAwesomeIcon icon={faChartColumn} color={COLORS.white} style={{ fontSize: 13, marginRight: 6 }} />
            <Text style={styles.sheetAnalyseText}>Analyse</Text>
          </TouchableOpacity>
        </View>

        <FilterBar
          activeLayer={activeLayer}
          sigFilter={sigFilter}
          panelTypeFilter={panelTypeFilter}
          panelStatusFilter={panelStatusFilter}
          onSigFilter={setSigFilter}
          onPanelTypeFilter={setPanelTypeFilter}
          onPanelStatusFilter={setPanelStatusFilter}
        />
      </View>

      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <VilleSelector
        visible={showVilleSelector}
        villes={villes}
        selected={selectedVille}
        onSelect={(villeId) => { setSelectedVille(villeId); setShowVilleSelector(false); }}
        onClose={() => setShowVilleSelector(false)}
      />

      <AnalyseVille
        visible={showAnalyse}
        villeId={selectedVille}
        villes={villes}
        apiGet={apiGet}
        onClose={() => setShowAnalyse(false)}
      />
    </View>
  );
}
