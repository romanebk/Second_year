import { COLORS } from '../constants/colors';
import { SIGNALEMENT_TYPES, PANEL_STATUSES } from '../constants/mapData';

export function getSignalementColor(type) {
  const found = SIGNALEMENT_TYPES.find((t) => t.value === type);
  return found ? found.color : COLORS.primary;
}

export function getPanelColor(etat) {
  const found = PANEL_STATUSES.find((s) => s.value === etat);
  return found ? found.color : COLORS.primary;
}

export function getZoneFillColor(type) {
  return COLORS.zone[type] || 'rgba(193,154,107,0.25)';
}

export function getZoneStrokeColor(type) {
  return COLORS.zoneStroke[type] || COLORS.primary;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
