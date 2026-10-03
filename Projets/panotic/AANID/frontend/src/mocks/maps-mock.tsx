import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { View, Text } from 'react-native';

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

const STYLE_ID = 'rn-maps-mock-style';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .leaflet-container { background: #EFE3CD !important; font-family: inherit; }
    /* Teinte chaude "sable" appliquée au fond cartographique clair */
    .leaflet-tile-pane { filter: sepia(0.22) saturate(1.05) brightness(1.02) hue-rotate(-8deg); }
    .leaflet-control-attribution {
      background: rgba(255,255,255,0.65) !important;
      font-size: 9px; color: #9C8F78; border-radius: 8px 0 0 0; padding: 1px 6px;
    }
    .leaflet-control-attribution a { color: #9C7C4F; }
    .custom-leaflet-marker-icon { background: transparent; border: none; }
    .custom-leaflet-popup .leaflet-popup-content-wrapper {
      border-radius: 16px; padding: 0; overflow: hidden; box-shadow: 0 10px 30px rgba(46,42,36,0.22);
    }
    .custom-leaflet-popup .leaflet-popup-content { margin: 0; }
    .custom-leaflet-popup .leaflet-popup-tip { box-shadow: 0 6px 16px rgba(46,42,36,0.18); }
  `;
  document.head.appendChild(style);
}

function loadLeaflet(callback) {
  if (window.L) {
    callback();
    return;
  }
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
  if (!document.getElementById('leaflet-js')) {
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => callback();
    document.body.appendChild(script);
  } else {
    const interval = setInterval(() => {
      if (window.L) {
        clearInterval(interval);
        callback();
      }
    }, 100);
  }
}

export const Marker = () => null;
export const Callout = () => null;
export const Polygon = () => null;
export const Polyline = () => null;
export const Circle = () => null;
export const Geojson = () => null;
export const Heatmap = () => null;
export const UrlTile = () => null;

function extractTileUrl(children) {
  let url = null;
  React.Children.forEach(children, (child) => {
    if (!child) return;
    const target = child.type === React.Fragment ? child.props.children : child;
    if (target?.props?.urlTemplate) url = target.props.urlTemplate;
  });
  return url;
}

const MapView = forwardRef(({ style, initialRegion, children, onPress }, ref) => {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const layersRef = useRef([]);
  const rootsRef = useRef([]);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration) => {
      if (mapInstanceRef.current && region) {
        const zoom = region.latitudeDelta
          ? Math.round(Math.log2(360 / region.latitudeDelta))
          : 15;
        mapInstanceRef.current.flyTo([region.latitude, region.longitude], Math.min(18, Math.max(3, zoom)), {
          animate: true, duration: duration ? duration / 1000 : 0.9,
        });
      }
    },
    getMapInstance: () => mapInstanceRef.current,
  }));

  useEffect(() => {
    injectStyles();
    loadLeaflet(() => setLeafletLoaded(true));
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !containerRef.current || mapInstanceRef.current) return;
    const lat = initialRegion?.latitude ?? 6.3653;
    const lng = initialRegion?.longitude ?? 2.4183;
    const zoom = initialRegion?.latitudeDelta
      ? Math.round(Math.log2(360 / initialRegion.latitudeDelta))
      : 13;
    const map = window.L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      zoomSnap: 0.25,
    }).setView([lat, lng], Math.min(18, Math.max(3, zoom)));
    const tileUrl = extractTileUrl(children) || 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    tileLayerRef.current = window.L.tileLayer(tileUrl, {
      maxZoom: 19, attribution: '© OpenStreetMap · CARTO', detectRetina: true,
    }).addTo(map);
    if (onPress) {
      map.on('click', (e) => onPress({ nativeEvent: { coordinate: { latitude: e.latlng.lat, longitude: e.latlng.lng } } }));
    }
    mapInstanceRef.current = map;
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const newUrl = extractTileUrl(children);
    if (newUrl && tileLayerRef.current && newUrl !== tileLayerRef.current._url) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = window.L.tileLayer(newUrl, {
        maxZoom: 19, attribution: '© OpenStreetMap · CARTO', detectRetina: true,
      }).addTo(map);
    }
  }, [children, leafletLoaded]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    rootsRef.current.forEach(root => {
      try { root.unmount(); } catch (e) {}
    });
    rootsRef.current = [];
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];

    const renderMarker = (child) => {
      const { coordinate, children: markerChildren, iconSize, iconAnchor, anchor, zIndexOffset } = child.props;
      const lat = coordinate.latitude;
      const lng = coordinate.longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number') return;

      let customGraphic = null;
      let calloutChild = null;
      React.Children.forEach(markerChildren, (mc) => {
        if (!mc) return;
        if (mc.props && mc.props.tooltip !== undefined) calloutChild = mc;
        else customGraphic = mc;
      });

      const markerOptions = { zIndexOffset: zIndexOffset || 0 };
      if (customGraphic) {
        const iconEl = document.createElement('div');
        iconEl.style.display = 'inline-block';
        iconEl.style.position = 'relative';
        const root = createRoot(iconEl);
        root.render(customGraphic);
        rootsRef.current.push(root);
        const size = Array.isArray(iconSize) ? iconSize : [36, 36];
        let anc = Array.isArray(iconAnchor) ? iconAnchor : null;
        if (!anc && anchor && typeof anchor.x === 'number') {
          anc = [size[0] * anchor.x, size[1] * anchor.y];
        }
        if (!anc) anc = [size[0] / 2, size[1] / 2];
        markerOptions.icon = window.L.divIcon({
          html: iconEl, className: 'custom-leaflet-marker-icon',
          iconSize: size, iconAnchor: anc,
        });
      }

      const marker = window.L.marker([lat, lng], markerOptions).addTo(map);
      layersRef.current.push(marker);

      if (calloutChild) {
        const popupEl = document.createElement('div');
        popupEl.style.minWidth = '220px';
        const root = createRoot(popupEl);
        root.render(calloutChild.props.children);
        rootsRef.current.push(root);
        marker.bindPopup(popupEl, { closeButton: false, className: 'custom-leaflet-popup', offset: [0, -6] });
        if (calloutChild.props.onPress) {
          marker.on('popupopen', () => {
            popupEl.onclick = () => calloutChild.props.onPress();
          });
        }
      }
      if (child.props.onPress) {
        marker.on('click', () => child.props.onPress({ nativeEvent: {} }));
      }
    };

    const renderPolyline = (child) => {
      const { coordinates, strokeColor, strokeWidth, lineDashPattern } = child.props;
      if (!Array.isArray(coordinates)) return;
      const latlngs = coordinates.map(c => [c.latitude, c.longitude]);
      const line = window.L.polyline(latlngs, {
        color: strokeColor || '#C19A6B',
        weight: strokeWidth || 4,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: Array.isArray(lineDashPattern) ? lineDashPattern.join(' ') : null,
      }).addTo(map);
      layersRef.current.push(line);
    };

    const renderPolygon = (child) => {
      const { coordinates, fillColor, strokeColor, strokeWidth, onPress } = child.props;
      if (!Array.isArray(coordinates)) return;
      const latlngs = coordinates.map(c => [c.latitude, c.longitude]);
      const polygon = window.L.polygon(latlngs, {
        color: strokeColor || '#9C7C4F', weight: strokeWidth || 2,
        fillColor: fillColor || '#C19A6B', fillOpacity: 0.35,
      }).addTo(map);
      layersRef.current.push(polygon);
      if (onPress) polygon.on('click', onPress);
    };

    const renderHeatmap = (child) => {
      const { points, radius } = child.props;
      if (!Array.isArray(points)) return;
      points.forEach(pt => {
        const lat = pt.latitude || pt.lat;
        const lng = pt.longitude || pt.lng;
        const weight = pt.weight || 1;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;
        const circle = window.L.circle([lat, lng], {
          radius: (radius || 40) * 1.6 * Math.sqrt(weight),
          color: '#C75D4F',
          fillColor: '#D9A441',
          fillOpacity: Math.min(0.4, 0.12 * weight),
          stroke: false,
        }).addTo(map);
        layersRef.current.push(circle);
      });
    };

    const processChild = (child) => {
      if (!child || !child.props) return;
      if (child.type === Polyline) return renderPolyline(child);
      if (child.type === Polygon) return renderPolygon(child);
      if (child.type === Heatmap) return renderHeatmap(child);
      if (child.props.coordinate) return renderMarker(child);
      if (child.props.points) return renderHeatmap(child);
      if (child.props.coordinates) return renderPolygon(child);
    };

    React.Children.forEach(children, (child) => {
      if (!child) return;
      if (child.type === React.Fragment) {
        React.Children.forEach(child.props.children, processChild);
      } else {
        processChild(child);
      }
    });
  }, [children, leafletLoaded]);

  return (
    <View ref={containerRef} style={{ width: '100%', height: '100%', ...(style || {}) }}>
      {!leafletLoaded && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFE3CD' }}>
          <Text style={{ color: '#9C7C4F' }}>Chargement de la carte...</Text>
        </View>
      )}
    </View>
  );
});

export default MapView;
