export const LAYERS = [
  { id: 'signalements', label: 'Signalements', icon: 'alert-circle' },
  { id: 'panneaux', label: 'Panneaux', icon: 'grid' },
  { id: 'zones', label: 'Zones', icon: 'square' },
  { id: 'heatmap', label: 'Chaleur', icon: 'thermometer' },
  { id: 'analyse', label: 'Analyse', icon: 'bar-chart' },
];

export const SIGNALEMENT_TYPES = [
  { label: 'Tous', value: 'tous', color: '#C19A6B' },
  { label: 'Bon État', value: 'BON_ETAT', color: '#6E8B5B' },
  { label: 'Dégradé', value: 'DEGRADE', color: '#D9A441' },
  { label: 'Obsolète', value: 'OBSOLETE', color: '#A89E90' },
  { label: 'Dangereux', value: 'DANGEREUX', color: '#C75D4F' },
  { label: 'Illégal', value: 'ILLEGAL', color: '#A8443A' },
  { label: 'En Travaux', value: 'TRAVAUX', color: '#C19A6B' },
];

export const PANEL_TYPES = [
  { label: 'Tous Types', value: 'tous', icon: 'grid' },
  { label: 'Classique', value: 'CLASSIQUE', icon: 'square' },
  { label: 'Digital', value: 'DIGITAL', icon: 'monitor' },
  { label: 'Abribus', value: 'ABRIBUS', icon: 'navigation' },
  { label: 'Totem', value: 'TOTEM', icon: 'arrow-up' },
  { label: 'Autre', value: 'AUTRE', icon: 'more-horizontal' },
];

export const PANEL_STATUSES = [
  { label: 'Tous États', value: 'tous', color: '#C19A6B' },
  { label: 'Disponible', value: 'DISPONIBLE', color: '#6E8B5B' },
  { label: 'Loué', value: 'LOUE', color: '#D9A441' },
  { label: 'Maintenance', value: 'MAINTENANCE', color: '#C75D4F' },
];

import {
  faScrewdriverWrench, faTriangleExclamation, faBan, faClock, faPersonDigging, faCircleCheck,
  faRectangleAd, faTv, faBusSimple, faTowerObservation, faLocationDot,
} from '@fortawesome/free-solid-svg-icons';

// Pictogrammes (FontAwesome) par type pour les marqueurs
export const SIGNALEMENT_ICONS = {
  DEGRADE: faScrewdriverWrench,
  DANGEREUX: faTriangleExclamation,
  ILLEGAL: faBan,
  OBSOLETE: faClock,
  TRAVAUX: faPersonDigging,
  BON_ETAT: faCircleCheck,
};

export const PANEL_ICONS = {
  CLASSIQUE: faRectangleAd,
  DIGITAL: faTv,
  ABRIBUS: faBusSimple,
  TOTEM: faTowerObservation,
  AUTRE: faLocationDot,
};

// Tuiles claires et épurées (rendu minimaliste façon application mobile)
export const TILE_URLS = {
  standard: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

// Vue initiale centrée sur Cotonou, zoom rapproché type "livraison"
export const INITIAL_REGION = {
  latitude: 6.3653,
  longitude: 2.4183,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

import { getApiBaseUrl } from '@aanid/shared/api';
export const API_BASE = getApiBaseUrl();
