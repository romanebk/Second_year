import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { INITIAL_REGION, TILE_URLS } from '../constants/mapData';

function latDeltaToZoom(latDelta) {
  if (!latDelta || latDelta <= 0) return 13;
  return Math.min(18, Math.max(3, Math.round(Math.log2(360 / latDelta))));
}

function buildMapHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
    .leaflet-container { background: #EFE3CD; font-family: system-ui, sans-serif; }
    .leaflet-tile-pane { filter: sepia(0.22) saturate(1.05) brightness(1.02) hue-rotate(-8deg); }
    .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,0.65) !important; }
    .aanid-pin { background: transparent; border: none; }
    .aanid-pin-head {
      width: 40px; height: 40px; border-radius: 20px; border: 3px solid #fff;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 10px rgba(46,42,36,0.28);
    }
    .aanid-pin-inner {
      width: 26px; height: 26px; border-radius: 13px; background: rgba(255,255,255,0.92);
      display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;
    }
    .aanid-popup .leaflet-popup-content-wrapper { border-radius: 14px; padding: 0; overflow: hidden; }
    .aanid-popup .leaflet-popup-content { margin: 0; min-width: 160px; }
    .aanid-popup-header { color: #fff; padding: 8px 12px; font-weight: 700; font-size: 13px; }
    .aanid-popup-body { padding: 10px 12px; font-size: 12px; color: #4A4338; }
    .aanid-popup-date { margin-top: 6px; font-size: 11px; color: #9C8F78; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map, tileLayer, markerLayer, polygonLayer, heatLayer;
    var ready = false;
    var pending = null;

    function initMap(cfg) {
      var lat = cfg.lat ?? 6.3653;
      var lng = cfg.lng ?? 2.4183;
      var zoom = cfg.zoom ?? 13;
      map = L.map('map', { zoomControl: true, attributionControl: true, zoomSnap: 0.25 })
        .setView([lat, lng], zoom);
      tileLayer = L.tileLayer(cfg.tileUrl, {
        maxZoom: 19,
        attribution: '© OpenStreetMap · CARTO',
        detectRetina: true,
      }).addTo(map);
      markerLayer = L.layerGroup().addTo(map);
      polygonLayer = L.layerGroup().addTo(map);
      ready = true;
      if (pending) { updateMap(pending); pending = null; }
    }

    function pinIcon(color, label, selected) {
      var scale = selected ? 1.12 : 1;
      return L.divIcon({
        className: 'aanid-pin',
        html: '<div style="transform:scale(' + scale + ');transform-origin:center bottom;">'
          + '<div class="aanid-pin-head" style="background:' + color + ';">'
          + '<div class="aanid-pin-inner" style="color:' + color + ';">' + (label || '•') + '</div>'
          + '</div></div>',
        iconSize: [44, 44],
        iconAnchor: [22, 40],
      });
    }

    function bindSelect(marker, item) {
      marker.on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'select', item: item }));
      });
    }

    function updateMap(cfg) {
      if (!ready) { pending = cfg; return; }
      if (cfg.tileUrl && tileLayer && tileLayer._url !== cfg.tileUrl) {
        map.removeLayer(tileLayer);
        tileLayer = L.tileLayer(cfg.tileUrl, {
          maxZoom: 19, attribution: '© OpenStreetMap · CARTO', detectRetina: true,
        }).addTo(map);
      }
      markerLayer.clearLayers();
      polygonLayer.clearLayers();
      if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }

      (cfg.markers || []).forEach(function(m) {
        var marker = L.marker([m.lat, m.lng], {
          icon: pinIcon(m.color, m.label, m.id === cfg.selectedId),
          zIndexOffset: m.id === cfg.selectedId ? 1000 : 0,
        });
        if (m.popup) {
          marker.bindPopup(m.popup, { className: 'aanid-popup', closeButton: false });
        }
        bindSelect(marker, m.item);
        markerLayer.addLayer(marker);
      });

      (cfg.polygons || []).forEach(function(p) {
        var poly = L.polygon(p.coords, {
          color: p.strokeColor, fillColor: p.fillColor, fillOpacity: 0.35, weight: 2,
        });
        poly.on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'select', item: p.item }));
        });
        polygonLayer.addLayer(poly);
      });

      if (cfg.heatmap && cfg.heatmap.length > 0) {
        heatLayer = L.heatLayer(cfg.heatmap, { radius: 40, blur: 25, maxZoom: 17, minOpacity: 0.35 });
        heatLayer.addTo(map);
      }
    }

    function flyTo(lat, lng, zoom) {
      if (!map) return;
      map.flyTo([lat, lng], zoom || map.getZoom(), { duration: 0.9 });
    }

    window.updateMap = updateMap;
    window.flyTo = flyTo;
    window.initMap = initMap;
  </script>
</body>
</html>`;
}

function buildMarkerPayload(activeLayer, signalements, panneaux, zones, heatmapPoints, selectedId, helpers) {
  const { getSignalementColor, getPanelColor, formatDate } = helpers;

  if (activeLayer === 'signalements') {
    return signalements.map((item) => {
      const color = getSignalementColor(item.type);
      const title = (item.type || '').replace('_', ' ');
      return {
        id: item.id,
        lat: item.lat,
        lng: item.lng,
        color,
        label: title.charAt(0),
        item: { type: 'signalement', ...item },
        popup: '<div class="aanid-popup-header" style="background:' + color + ';">' + title
          + '</div><div class="aanid-popup-body">' + (item.description || '')
          + '<div class="aanid-popup-date">' + formatDate(item.createdAt) + '</div></div>',
      };
    });
  }

  if (activeLayer === 'panneaux') {
    return panneaux.map((item) => {
      const color = helpers.getPanelColor(item.etat);
      return {
        id: item.id,
        lat: item.lat,
        lng: item.lng,
        color,
        label: (item.type || 'P').charAt(0),
        item: { type: 'panneau', ...item },
        popup: '<div class="aanid-popup-header" style="background:' + color + ';">' + (item.type || 'Panneau')
          + '</div><div class="aanid-popup-body">Format: ' + (item.format || '—')
          + '<br/>Régime: ' + (item.regime || '—')
          + '<div class="aanid-popup-date">' + (item.etat || '') + '</div></div>',
      };
    });
  }

  return [];
}

function buildPolygonPayload(zones, helpers) {
  return zones.map((item) => ({
    item: { type: 'zone', ...item },
    fillColor: helpers.getZoneFillColor(item.type),
    strokeColor: helpers.getZoneStrokeColor(item.type),
    coords: (item.boundary?.coordinates?.[0] || []).map((c) => [c[1], c[0]]),
  })).filter((p) => p.coords.length > 2);
}

const LeafletNativeMap = forwardRef(({
  style,
  mapType,
  activeLayer,
  signalements,
  panneaux,
  zones,
  heatmapPoints,
  onSelectItem,
  selectedId,
  helpers,
}, ref) => {
  const webViewRef = useRef(null);
  const html = useMemo(() => buildMapHtml(), []);

  const mapConfig = useMemo(() => {
    const tileUrl = TILE_URLS[mapType] || TILE_URLS.standard;
    const markers = activeLayer === 'zones' || activeLayer === 'heatmap'
      ? []
      : buildMarkerPayload(activeLayer, signalements, panneaux, zones, heatmapPoints, selectedId, helpers);
    const polygons = activeLayer === 'zones' ? buildPolygonPayload(zones, helpers) : [];
    const heatmap = activeLayer === 'heatmap'
      ? heatmapPoints.map((p) => [p.latitude, p.longitude, p.weight || 1])
      : [];
    return { tileUrl, markers, polygons, heatmap, selectedId };
  }, [mapType, activeLayer, signalements, panneaux, zones, heatmapPoints, selectedId, helpers]);

  const inject = useCallback((script) => {
    webViewRef.current?.injectJavaScript(`${script}; true;`);
  }, []);

  const pushConfig = useCallback(() => {
    const payload = JSON.stringify(mapConfig);
    inject(`window.updateMap(${payload})`);
  }, [inject, mapConfig]);

  useImperativeHandle(ref, () => ({
    animateToRegion(region, _duration) {
      const zoom = latDeltaToZoom(region?.latitudeDelta ?? INITIAL_REGION.latitudeDelta);
      inject(`window.flyTo(${region.latitude}, ${region.longitude}, ${zoom})`);
    },
  }));

  const onLoadEnd = useCallback(() => {
    const init = {
      lat: INITIAL_REGION.latitude,
      lng: INITIAL_REGION.longitude,
      zoom: latDeltaToZoom(INITIAL_REGION.latitudeDelta),
      tileUrl: TILE_URLS[mapType] || TILE_URLS.standard,
    };
    inject(`window.initMap(${JSON.stringify(init)})`);
    pushConfig();
  }, [inject, mapType, pushConfig]);

  useEffect(() => {
    pushConfig();
  }, [pushConfig]);

  const onMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'select' && data.item) onSelectItem(data.item);
    } catch (_) {}
  }, [onSelectItem]);

  return (
    <WebView
      ref={webViewRef}
      style={style}
      source={{ html }}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      mixedContentMode="always"
      onLoadEnd={onLoadEnd}
      onMessage={onMessage}
      onContentProcessDidTerminate={() => webViewRef.current?.reload()}
    />
  );
});

export default LeafletNativeMap;
