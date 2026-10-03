import React, { forwardRef } from 'react';
import { View } from 'react-native';

/** Stub natif : évite RNMapsAirModule (Google Maps). La carte réelle = LeafletNativeMap. */
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

const Noop = () => null;

export const Marker = Noop;
export const Callout = Noop;
export const Polygon = Noop;
export const Polyline = Noop;
export const Circle = Noop;
export const Geojson = Noop;
export const Heatmap = Noop;
export const UrlTile = Noop;

const MapView = forwardRef(({ style, children }, ref) => (
  <View ref={ref} style={style}>
    {children}
  </View>
));

export default MapView;
