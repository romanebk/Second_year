import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions,
  TextInput, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getApiBaseUrl } from '@aanid/shared/api';

const API_BASE = getApiBaseUrl();

// Palette « Sable » — alignée sur le thème AANID
const C = {
  primary: '#C19A6B',
  primaryDark: '#9C7C4F',
  secondary: '#8C6A43',
  vert: '#6E8B5B',
  orange: '#D9A441',
  rouge: '#C75D4F',
  bleu: '#9C7C4F',
  noir: '#2E2A24',
  gris: '#7A7166',
  grisClair: '#F9F1E5',
  grisMoyen: '#A89E90',
  blanc: '#FFFFFF',
  border: '#E8DCC8',
};

const MIN_W = 420;
const MAX_W = 1200;

function useT() {
  const { width } = useWindowDimensions();
  return Math.max(0, Math.min(1, (width - MIN_W) / (MAX_W - MIN_W)));
}

function useFluid() {
  const t = useT();
  return (a, b) => Math.round(a + (b - a) * t);
}

function api(endpoint, options) {
  return fetch(`${API_BASE}${endpoint}`, options).then(async (r) => {
    const body = await r.json().catch(() => null);
    if (!r.ok) throw new Error(body?.error || 'Erreur réseau');
    return body;
  });
}

const shadow = { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 };
const badgS = { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, flexShrink: 0 };

function formatNb(n) {
  if (n == null) return '—';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function timeAgo(createdAt) {
  if (!createdAt) return '';
  const diff = Date.now() - new Date(createdAt).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h}h`;
  const j = Math.floor(h / 24);
  return `il y a ${j}j`;
}

function SvgChevron() {
  return (
    <View style={{ width: 10, height: 6, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 7, height: 7, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: '#9b9b9b', transform: [{ rotate: '-45deg' }], marginTop: -3 }} />
    </View>
  );
}

// ─── Dropdown (desktop) ─────────────────────────────────────────────────────
function Dropdown({ label, value, options, onSelect, open, onToggle, f }) {
  return (
    <View style={{ position: 'relative', zIndex: open ? 60 : 1, minWidth: f(130, 150) }}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onToggle}
        style={{ backgroundColor: C.blanc, borderRadius: 8, paddingVertical: f(8, 8), paddingHorizontal: f(12, 14), ...shadow }}
      >
        <Text style={{ fontSize: f(10.5, 11), color: '#8a8a8a', marginBottom: 2 }}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ fontSize: f(12, 13), fontWeight: 'bold', color: C.noir }} numberOfLines={1}>{value}</Text>
          <SvgChevron />
        </View>
      </TouchableOpacity>
      {open && (
        <View style={{ position: 'absolute', top: '104%', left: 0, minWidth: '100%', backgroundColor: C.blanc, borderRadius: 8, paddingVertical: 4, ...shadow, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8, zIndex: 100 }}>
          {options.map((opt) => (
            <TouchableOpacity
              key={String(opt.value)}
              onPress={() => onSelect(opt.value)}
              style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: opt.label === value ? C.grisClair : 'transparent' }}
            >
              <Text style={{ fontSize: f(11.5, 12.5), color: C.noir, fontWeight: opt.label === value ? 'bold' : 'normal' }} numberOfLines={1}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Mobile FilterChip ──────────────────────────────────────────────────────
function FilterChip({ label, active, icon, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[{
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: active ? C.primary : C.blanc, borderRadius: 999,
        paddingHorizontal: 13, paddingVertical: 7, marginRight: 8,
        borderWidth: active ? 0 : 1, borderColor: C.border,
        ...shadow, shadowOpacity: active ? 0 : undefined, shadowRadius: active ? 0 : undefined,
      }]}
    >
      {icon && typeof icon === 'string' && icon !== 'geo' && <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: icon }} />}
      {icon === 'geo' && (
        <View style={{ width: 9, height: 9, borderRadius: 4.5, borderWidth: 1.8, borderColor: active ? C.blanc : C.noir }} />
      )}
      <Text style={{ fontSize: 11.5, fontWeight: 'bold', color: active ? C.blanc : C.noir }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── SVG-style Icons ────────────────────────────────────────────────────────
function IconScreen({ color, sz }) {
  const s = sz || 16;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: s, height: s * 0.69, borderRadius: 1.5, borderWidth: 1.8, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: -0.5, width: s * 0.35, height: s * 0.25, borderRadius: 999, backgroundColor: color }} />
    </View>
  );
}
function IconWarning({ color, sz }) {
  const s = sz || 16;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: s * 0.35, borderRightWidth: s * 0.35, borderBottomWidth: s * 0.7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
      <View style={{ position: 'absolute', top: s * 0.15, width: 1.5, height: s * 0.2, backgroundColor: C.blanc }} />
    </View>
  );
}
function IconPin({ color, sz }) {
  const s = sz || 16;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: s * 0.65, height: s * 0.65, borderRadius: s * 0.325, borderWidth: 1.8, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: 1, width: 1.5, height: s * 0.3, backgroundColor: color }} />
    </View>
  );
}
function IconCheck({ color, sz }) {
  const s = sz || 16;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: s * 0.7, height: s * 0.7, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: color, transform: [{ rotate: '-45deg' }], marginTop: -3 }} />
    </View>
  );
}
function IconPlus() {
  return (
    <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 14, height: 2.4, borderRadius: 1.2, backgroundColor: C.blanc }} />
      <View style={{ position: 'absolute', width: 2.4, height: 14, borderRadius: 1.2, backgroundColor: C.blanc }} />
    </View>
  );
}
function IconCamera() {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 20, height: 15, borderRadius: 3, borderWidth: 2, borderColor: C.blanc }} />
      <View style={{ position: 'absolute', top: 3, width: 6, height: 6, borderRadius: 3, backgroundColor: C.blanc }} />
    </View>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, delta, direction, foot, iconBg, children, compact, f }) {
  if (compact) {
    return (
      <View style={{ backgroundColor: C.blanc, borderRadius: 8, padding: f(12, 14), minWidth: f(110, 128), flexShrink: 0, ...shadow }}>
        <View style={{ width: f(22, 26), height: f(22, 26), borderRadius: 7, backgroundColor: iconBg, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>{children}</View>
        <Text style={{ fontSize: f(9.5, 10.5), color: '#6b6b6b', marginBottom: 4 }}>{label}</Text>
        <Text style={{ fontSize: f(19, 22), fontWeight: 'bold', lineHeight: f(19, 22) }}>{value}</Text>
        <Text style={{ fontSize: f(9.5, 10.5), fontWeight: 'bold', marginTop: 5, color: direction === 'up' ? C.vert : C.rouge }}>
          {direction === 'up' ? '↑' : '↓'} {delta}%
        </Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, minWidth: f(200, 240), backgroundColor: C.blanc, borderRadius: 8, padding: f(16, 18), ...shadow }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: f(12, 14) }}>
        <Text style={{ fontSize: f(12, 13), color: '#6b6b6b' }}>{label}</Text>
        <View style={{ width: f(26, 30), height: f(26, 30), borderRadius: 7, backgroundColor: iconBg, justifyContent: 'center', alignItems: 'center' }}>{children}</View>
      </View>
      <Text style={{ fontSize: f(26, 30), fontWeight: 'bold', lineHeight: f(26, 30) }}>{value}</Text>
      <Text style={{ fontSize: f(11, 12), fontWeight: 'bold', marginTop: 6, color: direction === 'up' ? C.vert : C.rouge }}>
        {direction === 'up' ? '↑' : '↓'} {delta}%{' '}
        <Text style={{ color: '#9b9b9b', fontWeight: 'normal' }}>ce mois</Text>
      </Text>
      <Text style={{ fontSize: f(10, 11), color: '#9b9b9b', marginTop: 6 }}>{foot}</Text>
    </View>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────
function Panel({ title, tag, link, onLinkPress, children, topPad, f }) {
  return (
    <View style={{ backgroundColor: C.blanc, borderRadius: 8, padding: f(16, 20), ...shadow }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: f(13, 14), fontWeight: 'bold', color: C.noir, flex: 1 }}>{title}</Text>
        {tag && <View style={{ backgroundColor: C.grisClair, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, marginLeft: 8 }}><Text style={{ fontSize: f(10, 11), color: '#6b6b6b' }}>{tag}</Text></View>}
        {link && (
          <TouchableOpacity onPress={onLinkPress} disabled={!onLinkPress}>
            <Text style={{ fontSize: f(11, 11.5), color: C.bleu, fontWeight: 'bold', marginLeft: 8 }}>{link}</Text>
          </TouchableOpacity>
        )}
      </View>
      {topPad != null && <View style={{ marginTop: topPad }} />}
      {children}
    </View>
  );
}

// ─── Legend ──────────────────────────────────────────────────────────────────
function Legend({ items, f, noMb }) {
  return (
    <View style={{ flexDirection: 'row', gap: f(12, 18), marginTop: 8, marginBottom: noMb ? 0 : f(4, 14), flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: f(5, 6) }}>
          <View style={{ width: f(7, 9), height: f(7, 9), borderRadius: f(3.5, 4.5), backgroundColor: item.color }} />
          <Text style={{ fontSize: f(10, 12), color: '#6b6b6b' }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Chart (données réelles de /etats-lieux → evolution) ────────────────────
function Chart({ evolution, f, compact }) {
  const h = Math.round(f(140, 230));
  const points = evolution && evolution.length > 0 ? evolution : [
    { jour: 'J1', modernes: 812, obsoletes: 472, signalements: 63 },
    { jour: 'J30', modernes: 892, obsoletes: 445, signalements: 82 },
  ];
  const maxBar = Math.max(...points.map(p => Math.max(p.modernes, p.obsoletes)), 1);
  const maxSig = Math.max(...points.map(p => p.signalements), 1);
  const chartH = h - 26;

  return (
    <View>
      <Legend items={[
        { color: C.vert, label: compact ? 'Modernes' : 'Panneaux modernes' },
        { color: C.orange, label: compact ? 'Obsolètes' : 'Panneaux obsolètes' },
        { color: C.rouge, label: compact ? 'Signalements' : 'Signalements cumulés' },
      ]} f={f} noMb={compact} />
      <View style={{ width: '100%', height: h, marginTop: compact ? 8 : 4 }}>
        <View style={{ flexDirection: 'row', height: chartH, alignItems: 'flex-end' }}>
          {!compact && (
            <View style={{ width: 38, height: chartH, justifyContent: 'space-between', paddingRight: 6 }}>
              <Text style={{ fontSize: 10, color: '#9b9b9b', textAlign: 'right' }}>{formatNb(maxBar)}</Text>
              <Text style={{ fontSize: 10, color: '#9b9b9b', textAlign: 'right' }}>{formatNb(Math.round(maxBar / 2))}</Text>
              <Text style={{ fontSize: 10, color: '#9b9b9b', textAlign: 'right' }}>0</Text>
            </View>
          )}
          {points.map((p) => {
            const hMod = Math.max(3, Math.round((p.modernes / maxBar) * chartH));
            const hObs = Math.max(3, Math.round((p.obsoletes / maxBar) * chartH));
            const hSig = Math.max(3, Math.round((p.signalements / maxSig) * chartH * 0.5));
            return (
              <View key={p.jour} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: f(3, 5) }}>
                  <View style={{ width: f(9, 16), height: hMod, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: C.vert }} />
                  <View style={{ width: f(9, 16), height: hObs, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: C.orange }} />
                  <View style={{ width: f(5, 8), height: hSig, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: C.rouge }} />
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ height: 1, backgroundColor: '#ececec', marginLeft: compact ? 0 : 38 }} />
        <View style={{ flexDirection: 'row', marginLeft: compact ? 0 : 38, marginTop: 5 }}>
          {points.map((p) => (
            <View key={p.jour} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: f(9, 10), color: '#9b9b9b' }}>{p.jour}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── MiniMap ─────────────────────────────────────────────────────────────────
function MiniMap({ compact, f, totalPoints }) {
  const h = Math.round(f(160, 230));
  const pinS = Math.round(f(11, 14));
  const pins = compact
    ? [{ top: 25, left: 50, c: C.vert }, { top: 65, left: 110, c: C.orange }, { top: 45, left: 150, c: C.rouge }, { top: 105, left: 200, c: C.bleu }, { top: 115, left: 70, c: C.rouge }]
    : [{ top: 40, left: 70, c: C.vert }, { top: 95, left: 150, c: C.orange }, { top: 70, left: 200, c: C.rouge }, { top: 150, left: 240, c: C.bleu }, { top: 160, left: 60, c: C.rouge }, { top: 180, left: 130, c: C.vert }];
  return (
    <View>
      <View style={{ height: h, borderRadius: 7, backgroundColor: '#EADBC6', position: 'relative', overflow: 'hidden', marginTop: compact ? 4 : 0 }}>
        <View style={{ position: 'absolute', top: compact ? 20 : 30, left: compact ? 40 : 50, width: compact ? 70 : 100, height: compact ? 70 : 100, borderRadius: compact ? 35 : 50, backgroundColor: C.rouge, opacity: 0.15 }} />
        <View style={{ position: 'absolute', top: compact ? 50 : 80, left: compact ? 130 : 170, width: compact ? 60 : 80, height: compact ? 60 : 80, borderRadius: compact ? 30 : 40, backgroundColor: C.orange, opacity: 0.12 }} />
        <View style={{ position: 'absolute', top: compact ? 30 : 45, width: '70%', left: 0, height: 3, borderRadius: 1.5, backgroundColor: '#D9C2A0', transform: [{ rotate: compact ? '-3deg' : '-2deg' }], opacity: 0.6 }} />
        <View style={{ position: 'absolute', top: compact ? 90 : 130, width: '60%', right: 0, height: 3, borderRadius: 1.5, backgroundColor: '#D9C2A0', transform: [{ rotate: compact ? '2deg' : '1deg' }], opacity: 0.6 }} />
        {pins.map((p, i) => (
          <View key={i} style={{ position: 'absolute', top: p.top, left: p.left, width: pinS, height: pinS, borderRadius: pinS / 2, backgroundColor: p.c, borderWidth: 2, borderColor: C.blanc, ...shadow }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: compact ? 'flex-start' : 'space-between', marginTop: f(8, 10) }}>
        <View style={{ flexDirection: 'row', gap: f(8, 12), flexWrap: 'wrap', alignItems: 'center' }}>
          {[{ c: C.vert, l: 'Moderne' }, { c: C.orange, l: 'Obsolète' }, { c: C.rouge, l: 'Dégradé' }, { c: C.bleu, l: 'Disponible' }].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <View style={{ width: f(6, 6), height: f(6, 6), borderRadius: 3, backgroundColor: item.c }} />
              <Text style={{ fontSize: f(10, 11), color: '#9b9b9b' }}>{item.l}</Text>
            </View>
          ))}
        </View>
        {!compact && <Text style={{ fontSize: f(10, 11), color: '#9b9b9b' }}>{formatNb(totalPoints || 1284)} points</Text>}
      </View>
    </View>
  );
}

// ─── Donut ───────────────────────────────────────────────────────────────────
function Donut({ pct, compact, f, t }) {
  const oS = Math.round(f(100, 140));
  const oB = Math.round(f(10, 14));
  const pctS = Math.round(f(22, 26));
  const subS = Math.round(f(8.5, 11));
  return (
    <View style={{ flexDirection: compact ? 'row' : 'column', alignItems: 'center', gap: compact ? f(14, 20) : 0 }}>
      <View style={{ width: oS, height: oS, borderRadius: oS / 2, borderWidth: oB, borderColor: C.grisClair, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <View style={{ position: 'absolute', width: oS, height: oS, borderRadius: oS / 2, borderWidth: oB, borderColor: 'transparent', borderTopColor: C.vert, borderRightColor: C.vert, transform: [{ rotate: `${-90 + (pct / 100) * 360}deg` }] }} />
        <View style={{ width: oS - oB * 2, height: oS - oB * 2, borderRadius: (oS - oB * 2) / 2, backgroundColor: C.blanc, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: pctS, fontWeight: 'bold', color: C.noir }}>{pct}%</Text>
          <Text style={{ fontSize: subS, color: '#9b9b9b', marginTop: t < 0.3 ? 0 : 2 }}>
            {compact ? 'conformité' : 'conformité moyenne'}
          </Text>
        </View>
      </View>
      {compact ? (
        <View style={{}}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.vert }} />
            <Text style={{ fontSize: f(10.5, 11), color: '#444' }}>Conforme</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.blanc, borderWidth: 1, borderColor: '#ddd' }} />
            <Text style={{ fontSize: f(10.5, 11), color: '#444' }}>À revoir</Text>
          </View>
          <Text style={{ fontSize: f(9.5, 10), color: '#9b9b9b', marginTop: 4 }}>Objectif annuel : 85%</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.vert }} />
            <Text style={{ fontSize: f(10.5, 11), color: '#6b6b6b' }}>Conforme</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.blanc, borderWidth: 1, borderColor: '#ddd' }} />
            <Text style={{ fontSize: f(10.5, 11), color: '#6b6b6b' }}>À revoir</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Signalement Item ────────────────────────────────────────────────────────
function SigItem({ sig, compact, f, onPress }) {
  const { titre, zone, createdAt, date, statut, statutColor, type } = sig;
  const thumbS = Math.round(f(38, 42));
  const iconS = Math.round(f(18, 20));
  const dateLabel = createdAt ? timeAgo(createdAt) : (date || '');
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={compact ? {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: C.blanc,
        borderRadius: 8, padding: 11, marginBottom: 9, ...shadow,
      } : {
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
      }}
    >
      <View style={{ width: thumbS, height: thumbS, borderRadius: 7, backgroundColor: C.grisClair, justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
        <IconScreen color={statutColor} sz={iconS} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: f(12, 13), fontWeight: 'bold', color: C.noir }}>{titre}</Text>
        <Text style={{ fontSize: f(10, 11), color: '#9b9b9b', marginTop: 2 }}>
          {compact ? `${zone} · ${dateLabel}` : `${zone} · ${dateLabel}${type ? ` · ${type} jointe` : ''}`}
        </Text>
      </View>
      <View style={[badgS, { backgroundColor: statutColor + '1E' }]}>
        <Text style={{ fontSize: compact ? f(9, 9.5) : f(9.5, 10), fontWeight: 'bold', color: statutColor }}>{statut}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── CatBar ──────────────────────────────────────────────────────────────────
function CatBar({ nom, count, color, pct, compact, f }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: f(8, 10), marginBottom: compact ? f(10, 11) : f(12, 14) }}>
      <Text style={{ fontSize: f(10.5, 12), width: compact ? f(85, 100) : f(105, 118), color: '#444', flexShrink: 0 }} numberOfLines={1}>{nom}</Text>
      <View style={{ flex: 1, height: compact ? f(6.5, 7) : f(7.5, 8), backgroundColor: C.grisClair, borderRadius: 5, overflow: 'hidden' }}>
        <View style={{ height: '100%', borderRadius: 5, width: `${pct}%`, backgroundColor: color }} />
      </View>
      <Text style={{ fontSize: f(10.5, 12), fontWeight: 'bold', width: compact ? f(18, 20) : f(24, 28), textAlign: 'right' }}>{count}</Text>
    </View>
  );
}

// ─── Choix (chips dans les formulaires) ─────────────────────────────────────
function ChoiceChips({ options, value, onSelect }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            style={{
              paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
              backgroundColor: active ? C.primary : C.grisClair,
              borderWidth: 1, borderColor: active ? C.primary : C.border,
            }}
          >
            <Text style={{ fontSize: 11.5, fontWeight: active ? 'bold' : 'normal', color: active ? C.blanc : C.noir }}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Overlay ─────────────────────────────────────────────────────────────────
function Overlay({ onClose, children }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(46,42,36,0.45)' }]} />
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }} pointerEvents="box-none">
        <View style={{ backgroundColor: C.blanc, borderRadius: 16, padding: 20, maxWidth: 520, width: '100%', alignSelf: 'center', maxHeight: '90%', ...shadow, shadowOpacity: 0.25, shadowRadius: 24, elevation: 12 }}>
          {children}
        </View>
      </View>
    </View>
  );
}

// ─── Formulaire nouveau signalement ─────────────────────────────────────────
function SignalementForm({ zones, types, onClose, onCreated }) {
  const [titre, setTitre] = useState('');
  const [categorie, setCategorie] = useState(types[0]);
  const [zone, setZone] = useState(zones[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!titre.trim()) {
      setError('Veuillez saisir un titre.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const created = await api('/etats-lieux/signalements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, categorie, zone, description }),
      });
      onCreated(created);
    } catch (e) {
      setError(e.message || 'Impossible d\'envoyer le signalement. Vérifiez votre connexion.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 17, fontWeight: 'bold', color: C.noir, marginBottom: 14 }}>Nouveau signalement</Text>

        <Text style={formStyles.label}>Titre *</Text>
        <TextInput
          style={formStyles.input}
          placeholder="Ex : Panneau dégradé — Av. Steinmetz"
          placeholderTextColor={C.grisMoyen}
          value={titre}
          onChangeText={setTitre}
        />

        <Text style={formStyles.label}>Catégorie</Text>
        <ChoiceChips options={types} value={categorie} onSelect={setCategorie} />

        <Text style={formStyles.label}>Zone</Text>
        <ChoiceChips options={zones} value={zone} onSelect={setZone} />

        <Text style={formStyles.label}>Description</Text>
        <TextInput
          style={[formStyles.input, { height: 72, textAlignVertical: 'top' }]}
          placeholder="Décrivez le problème constaté…"
          placeholderTextColor={C.grisMoyen}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {error ? <Text style={{ fontSize: 12, color: C.rouge, marginTop: 10 }}>{error}</Text> : null}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <TouchableOpacity onPress={onClose} style={[formStyles.btn, { backgroundColor: C.grisClair }]}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: C.gris }}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={submit} disabled={submitting} style={[formStyles.btn, { flex: 1, backgroundColor: C.primary }]}>
            {submitting
              ? <ActivityIndicator size="small" color={C.blanc} />
              : <Text style={{ fontSize: 13, fontWeight: 'bold', color: C.blanc }}>Envoyer le signalement</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Overlay>
  );
}

// ─── Détail signalement + changement de statut ──────────────────────────────
const STATUTS = ['Nouveau', 'En cours', 'Urgent', 'Résolu'];
const STATUT_COLORS = { Nouveau: '#6b6b6b', 'En cours': '#C99A4E', Urgent: '#D4654A', 'Résolu': '#8B9D77' };

function SignalementDetail({ sig, onClose, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const changeStatut = async (statut) => {
    if (statut === sig.statut) return;
    setSaving(true);
    setError('');
    try {
      const updated = await api(`/etats-lieux/signalements/${sig.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      });
      onUpdated(updated);
    } catch (e) {
      setError(e.message || 'Mise à jour impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: C.noir }}>{sig.titre}</Text>
      <Text style={{ fontSize: 12, color: C.grisMoyen, marginTop: 4 }}>
        {sig.zone} · {sig.createdAt ? timeAgo(sig.createdAt) : sig.date}{sig.categorie ? ` · ${sig.categorie}` : ''}
      </Text>
      {sig.description ? (
        <Text style={{ fontSize: 13, color: C.gris, marginTop: 12, lineHeight: 19 }}>{sig.description}</Text>
      ) : null}

      <Text style={[formStyles.label, { marginTop: 18 }]}>Statut</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {STATUTS.map((s) => {
          const active = s === sig.statut;
          const color = STATUT_COLORS[s];
          return (
            <TouchableOpacity
              key={s}
              disabled={saving}
              onPress={() => changeStatut(s)}
              style={{
                paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999,
                backgroundColor: active ? color : color + '1E',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: active ? C.blanc : color }}>{s}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {saving && <ActivityIndicator size="small" color={C.primary} style={{ marginTop: 10 }} />}
      {error ? <Text style={{ fontSize: 12, color: C.rouge, marginTop: 10 }}>{error}</Text> : null}

      <TouchableOpacity onPress={onClose} style={[formStyles.btn, { backgroundColor: C.grisClair, marginTop: 18 }]}>
        <Text style={{ fontSize: 13, fontWeight: 'bold', color: C.gris }}>Fermer</Text>
      </TouchableOpacity>
    </Overlay>
  );
}

const formStyles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: C.noir,
    marginTop: 14,
    marginBottom: 7,
  },
  input: {
    backgroundColor: C.grisClair,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: C.noir,
  },
  btn: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'tous', label: 'Tous' },
  { id: 'modernes', label: 'Résolus', icon: C.vert },
  { id: 'obsoletes', label: 'Obsolètes', icon: C.orange },
  { id: 'degrades', label: 'Dégradés', icon: C.rouge },
  { id: 'nouveaux', label: 'Nouveaux', icon: C.grisMoyen },
];

function matchesChip(sig, filterId) {
  if (filterId === 'tous') return true;
  const s = (sig.statut || '').toLowerCase();
  const cat = (sig.categorie || sig.titre || '').toLowerCase();
  if (filterId === 'modernes') return s === 'résolu' || s === 'resolu';
  if (filterId === 'obsoletes') return cat.includes('obsolète') || cat.includes('obsolete');
  if (filterId === 'degrades') return cat.includes('dégradé') || cat.includes('degrade') || cat.includes('dangereux') || s === 'urgent';
  if (filterId === 'nouveaux') return s === 'nouveau';
  return true;
}

const PERIODES = [
  { label: '7 derniers jours', value: 7 },
  { label: '30 derniers jours', value: 30 },
  { label: '90 derniers jours', value: 90 },
  { label: 'Tout', value: 0 },
];

const FALLBACK_SIGNALEMENTS = [
  { id: 'demo-1', titre: 'Panneau dégradé — Av. Steinmetz', zone: 'Akpakpa', categorie: 'Panneau dégradé', createdAt: new Date(Date.now() - 2 * 3600e3).toISOString(), statut: 'Urgent', statutColor: '#C75D4F', type: 'photo' },
  { id: 'demo-2', titre: 'Panneau obsolète — Rond-point Étoile Rouge', zone: 'Ganhi', categorie: 'Panneau obsolète', createdAt: new Date(Date.now() - 5 * 3600e3).toISOString(), statut: 'En cours', statutColor: '#D9A441', type: 'vidéo' },
  { id: 'demo-3', titre: 'Emplacement inapproprié — Marché Dantokpa', zone: 'Dantokpa', categorie: 'Emplacement inapproprié', createdAt: new Date(Date.now() - 24 * 3600e3).toISOString(), statut: 'Nouveau', statutColor: '#A89E90' },
  { id: 'demo-4', titre: 'Besoin de maintenance — Bd. de la Marina', zone: 'Haie Vive', categorie: 'Besoin de maintenance', createdAt: new Date(Date.now() - 48 * 3600e3).toISOString(), statut: 'Résolu', statutColor: '#6E8B5B' },
];

const FALLBACK_CATEGORIES = [
  { nom: 'Panneau dégradé', count: 24, color: C.rouge, pct: 82 },
  { nom: 'Panneau dangereux', count: 11, color: C.rouge, pct: 38 },
  { nom: 'Panneau obsolète', count: 17, color: C.orange, pct: 58 },
  { nom: 'Emplacement inapproprié', count: 7, color: C.bleu, pct: 24 },
  { nom: 'Besoin de maintenance', count: 4, color: C.vert, pct: 14 },
];

const FALLBACK_ZONES = ['Akpakpa', 'Ganhi', 'Dantokpa', 'Haie Vive'];
const FALLBACK_TYPES = ['Panneau dégradé', 'Panneau dangereux', 'Panneau obsolète', 'Emplacement inapproprié', 'Besoin de maintenance'];

export default function EtatsDesLieux() {
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  // Filtres mobile (chips) et desktop (dropdowns)
  const [activeFilter, setActiveFilter] = useState('tous');
  const [periode, setPeriode] = useState(30);
  const [typeFilter, setTypeFilter] = useState('toutes');
  const [statutFilter, setStatutFilter] = useState('tous');
  const [zoneFilter, setZoneFilter] = useState('toutes');
  const [openDropdown, setOpenDropdown] = useState(null);

  const [showAll, setShowAll] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const t = useT();
  const f = useFluid();

  const loadData = useCallback(async () => {
    try {
      const result = await api('/etats-lieux');
      setData(result);
      setOffline(false);
    } catch {
      setData(null);
      setOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const k = data?.kpis;
  const signalements = data?.signalements?.length ? data.signalements : FALLBACK_SIGNALEMENTS;
  const categories = data?.categories?.length ? data.categories : FALLBACK_CATEGORIES;
  const zones = data?.zones?.length ? data.zones : FALLBACK_ZONES;
  const types = data?.typesSignalement?.length ? data.typesSignalement : FALLBACK_TYPES;
  const conformite = data?.conformite?.taux ?? 78.4;
  const evolution = data?.evolution;

  const filteredSignalements = useMemo(() => {
    return signalements.filter((sig) => {
      if (isMobile) {
        if (!matchesChip(sig, activeFilter)) return false;
      } else {
        if (statutFilter !== 'tous' && sig.statut !== statutFilter) return false;
        if (typeFilter !== 'toutes' && sig.categorie !== typeFilter) return false;
        if (zoneFilter !== 'toutes' && sig.zone !== zoneFilter) return false;
      }
      if (periode > 0 && sig.createdAt) {
        if (new Date(sig.createdAt).getTime() < Date.now() - periode * 24 * 3600e3) return false;
      }
      return true;
    });
  }, [signalements, isMobile, activeFilter, statutFilter, typeFilter, zoneFilter, periode]);

  const visibleSignalements = showAll ? filteredSignalements : filteredSignalements.slice(0, 4);

  const handleCreated = useCallback(() => {
    setFormVisible(false);
    loadData();
  }, [loadData]);

  const handleUpdated = useCallback((updated) => {
    setSelected(updated);
    setData((prev) => prev ? {
      ...prev,
      signalements: prev.signalements.map(s => s.id === updated.id ? updated : s),
    } : prev);
  }, []);

  const overlays = (
    <>
      {formVisible && (
        <SignalementForm
          zones={zones}
          types={types}
          onClose={() => setFormVisible(false)}
          onCreated={handleCreated}
        />
      )}
      {selected && (
        <SignalementDetail
          sig={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );

  const offlineBanner = offline ? (
    <View style={{ backgroundColor: 'rgba(199,93,79,0.12)', borderRadius: 8, padding: 10, marginBottom: 14 }}>
      <Text style={{ fontSize: 12, color: C.rouge }}>
        Serveur inaccessible — affichage de données de démonstration. Tirez pour réessayer.
      </Text>
    </View>
  ) : null;

  const topPd = Math.round(f(24, 28));
  const pageTtlS = Math.round(f(22, 26));
  const pageSubS = Math.round(f(12, 13));
  const bdgPv = Math.round(f(6, 7));
  const bdgPh = Math.round(f(12, 14));
  const kpiGap = Math.round(f(10, 16));

  // ── Desktop Layout ──────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, backgroundColor: C.grisClair }}
          contentContainerStyle={{ padding: topPd, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
            <View>
              <Text style={{ fontSize: pageTtlS, fontWeight: 'bold', marginTop: 2, color: C.noir }}>États des Lieux</Text>
              <Text style={{ fontSize: pageSubS, color: '#6b6b6b', marginTop: 2 }}>Suivi en temps réel de la panneautique publicitaire</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.blanc, borderRadius: 999, paddingVertical: bdgPv, paddingRight: bdgPh + 4, paddingLeft: bdgPh - 2, ...shadow }}>
              <View style={{ width: f(20, 22), height: f(20, 22), borderRadius: f(10, 11), backgroundColor: C.rouge, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: C.blanc, fontSize: f(10, 11), fontWeight: 'bold' }}>CO</Text>
              </View>
              <Text style={{ fontSize: f(12, 13), fontWeight: 'bold', color: C.noir }}>Cotonou</Text>
            </View>
          </View>

          {offlineBanner}

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap', zIndex: 50 }}>
            <Dropdown
              label="Période"
              value={PERIODES.find(p => p.value === periode)?.label || 'Tout'}
              options={PERIODES}
              open={openDropdown === 'periode'}
              onToggle={() => setOpenDropdown(openDropdown === 'periode' ? null : 'periode')}
              onSelect={(v) => { setPeriode(v); setOpenDropdown(null); }}
              f={f}
            />
            <Dropdown
              label="Type de panneau"
              value={typeFilter === 'toutes' ? 'Tous' : typeFilter}
              options={[{ label: 'Tous', value: 'toutes' }, ...types.map(ty => ({ label: ty, value: ty }))]}
              open={openDropdown === 'type'}
              onToggle={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
              onSelect={(v) => { setTypeFilter(v); setOpenDropdown(null); }}
              f={f}
            />
            <Dropdown
              label="Statut signalement"
              value={statutFilter === 'tous' ? 'Tous' : statutFilter}
              options={[{ label: 'Tous', value: 'tous' }, ...STATUTS.map(s => ({ label: s, value: s }))]}
              open={openDropdown === 'statut'}
              onToggle={() => setOpenDropdown(openDropdown === 'statut' ? null : 'statut')}
              onSelect={(v) => { setStatutFilter(v); setOpenDropdown(null); }}
              f={f}
            />
            <Dropdown
              label="Zone"
              value={zoneFilter === 'toutes' ? 'Toutes zones' : zoneFilter}
              options={[{ label: 'Toutes zones', value: 'toutes' }, ...zones.map(z => ({ label: z, value: z }))]}
              open={openDropdown === 'zone'}
              onToggle={() => setOpenDropdown(openDropdown === 'zone' ? null : 'zone')}
              onSelect={(v) => { setZoneFilter(v); setOpenDropdown(null); }}
              f={f}
            />
            <TouchableOpacity
              style={{ marginLeft: 'auto', backgroundColor: C.primary, borderRadius: 8, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 8, ...shadow, height: f(44, 48) }}
              onPress={() => setFormVisible(true)}
            >
              <IconPlus />
              <Text style={{ color: C.blanc, fontSize: f(12, 13), fontWeight: 'bold' }}>Nouveau signalement</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: kpiGap, marginBottom: 18 }}>
            <KpiCard label="Panneaux recensés" value={k ? formatNb(k.panneauxRecenses.valeur) : '1,284'} delta={k?.panneauxRecenses.delta ?? '6.2'} direction="up" foot={k?.panneauxRecenses.details ?? 'dont 812 modernes'} iconBg="rgba(168,180,196,0.16)" f={f}>
              <IconScreen color={C.bleu} />
            </KpiCard>
            <KpiCard label="Panneaux obsolètes" value={k ? formatNb(k.panneauxObsoletes.valeur) : '472'} delta={k?.panneauxObsoletes.delta ?? '2.1'} direction="up" foot={k?.panneauxObsoletes.details ?? '36,8% du parc total'} iconBg="rgba(201,154,78,0.16)" f={f}>
              <IconWarning color={C.orange} />
            </KpiCard>
            <KpiCard label="Signalements actifs" value={k ? formatNb(k.signalementsActifs.valeur) : '63'} delta={k?.signalementsActifs.delta ?? '11'} direction="up" foot={k?.signalementsActifs.details ?? '18 en attente de validation'} iconBg="rgba(212,101,74,0.14)" f={f}>
              <IconPin color={C.rouge} />
            </KpiCard>
            <KpiCard label="Taux de conformité" value={k ? `${k.tauxConformite.valeur}%` : '78.4%'} delta={k?.tauxConformite.delta ?? '3.4'} direction="up" foot={k?.tauxConformite.details ?? 'objectif annuel : 85%'} iconBg="rgba(139,157,119,0.16)" f={f}>
              <IconCheck color={C.vert} />
            </KpiCard>
          </View>

          <View style={{ flexDirection: width < 960 ? 'column' : 'row', gap: 16, marginBottom: 16 }}>
            <View style={{ flex: width < 960 ? undefined : 2 }}>
              <Panel title="Évolution du parc publicitaire — 30 derniers jours" tag="Cotonou" f={f}>
                <Chart evolution={evolution} f={f} />
              </Panel>
            </View>
            <View style={{ flex: width < 960 ? undefined : 1 }}>
              <Panel title="Carte interactive" tag="Heatmap" link="Plein écran" onLinkPress={() => navigation.navigate('Carte')} f={f}>
                <MiniMap f={f} totalPoints={data?.carte?.totalPoints} />
              </Panel>
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <View style={{ flex: 1, minWidth: width < 768 ? '100%' : f(300, 380) }}>
              <Panel
                title="Signalements récents"
                tag={`${filteredSignalements.length} affiché(s)`}
                link={filteredSignalements.length > 4 ? (showAll ? 'Réduire' : 'Voir tout') : null}
                onLinkPress={() => setShowAll(!showAll)}
                f={f}
              >
                {visibleSignalements.length === 0 ? (
                  <Text style={{ fontSize: 13, color: C.grisMoyen, textAlign: 'center', marginVertical: 20 }}>
                    Aucun signalement ne correspond aux filtres.
                  </Text>
                ) : (
                  visibleSignalements.map(sig => (
                    <SigItem key={sig.id} sig={sig} f={f} onPress={() => setSelected(sig)} />
                  ))
                )}
              </Panel>
            </View>
            <View style={{ flex: 1, minWidth: width < 768 ? '100%' : f(260, 320) }}>
              <Panel title="Signalements par catégorie" topPad={14} f={f}>
                {categories.map((c, i) => <CatBar key={i} {...c} f={f} />)}
              </Panel>
            </View>
            <View style={{ flex: 1, minWidth: width < 768 ? '100%' : f(240, 300) }}>
              <Panel title="Qualité de l'aménagement" f={f}>
                <Donut pct={conformite} f={f} t={t} />
              </Panel>
            </View>
          </View>
        </ScrollView>
        {overlays}
      </View>
    );
  }

  // ── Mobile Layout ──────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: C.grisClair }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        <View style={mobileStyles.header}>
          <Text style={mobileStyles.headerTitle}>États des Lieux</Text>
          <Text style={mobileStyles.headerSubtitle}>Suivi en temps réel de la panneautique</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 18, marginBottom: 14 }} contentContainerStyle={{ paddingRight: 18 }}>
          {FILTERS.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              icon={filter.icon}
              active={activeFilter === filter.id}
              onPress={() => setActiveFilter(filter.id)}
            />
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {offline && <View style={{ paddingHorizontal: 18 }}>{offlineBanner}</View>}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 18, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <KpiCard compact label="Panneaux recensés" value={k ? formatNb(k.panneauxRecenses.valeur) : '1,284'} delta={k?.panneauxRecenses.delta ?? '6.2'} direction="up" iconBg="rgba(168,180,196,0.16)" f={f}>
                  <IconScreen color={C.bleu} sz={14} />
                </KpiCard>
                <KpiCard compact label="Obsolètes" value={k ? formatNb(k.panneauxObsoletes.valeur) : '472'} delta={k?.panneauxObsoletes.delta ?? '2.1'} direction="up" iconBg="rgba(201,154,78,0.16)" f={f}>
                  <IconWarning color={C.orange} sz={14} />
                </KpiCard>
                <KpiCard compact label="Signalements" value={k ? formatNb(k.signalementsActifs.valeur) : '63'} delta={k?.signalementsActifs.delta ?? '11'} direction="up" iconBg="rgba(212,101,74,0.14)" f={f}>
                  <IconPin color={C.rouge} sz={14} />
                </KpiCard>
                <KpiCard compact label="Conformité" value={k ? `${k.tauxConformite.valeur}%` : '78.4%'} delta={k?.tauxConformite.delta ?? '3.4'} direction="up" iconBg="rgba(139,157,119,0.16)" f={f}>
                  <IconCheck color={C.vert} sz={14} />
                </KpiCard>
              </View>
            </ScrollView>

            <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: f(13, 14), fontWeight: 'bold', color: C.noir }}>Évolution sur 30 jours</Text>
              </View>
              <Panel f={f}><Chart evolution={evolution} compact f={f} /></Panel>
            </View>

            <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: f(13, 14), fontWeight: 'bold', color: C.noir }}>Carte interactive</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Carte')}>
                  <Text style={{ fontSize: f(11, 11.5), color: C.primaryDark, fontWeight: 'bold' }}>Plein écran</Text>
                </TouchableOpacity>
              </View>
              <Panel f={f}><MiniMap compact f={f} /></Panel>
            </View>

            <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: f(13, 14), fontWeight: 'bold', color: C.noir }}>Signalements récents</Text>
                {filteredSignalements.length > 4 && (
                  <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                    <Text style={{ fontSize: f(11, 11.5), color: C.primaryDark, fontWeight: 'bold' }}>
                      {showAll ? 'Réduire' : `Voir tout (${filteredSignalements.length})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {visibleSignalements.length === 0 ? (
                <Text style={{ fontSize: 14, color: C.grisMoyen, textAlign: 'center', marginVertical: 24 }}>
                  Aucun signalement pour ce filtre
                </Text>
              ) : (
                visibleSignalements.map(sig => (
                  <SigItem key={sig.id} sig={sig} compact f={f} onPress={() => setSelected(sig)} />
                ))
              )}
            </View>

            <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: f(13, 14), fontWeight: 'bold', color: C.noir }}>Par catégorie</Text>
              </View>
              <Panel topPad={14} f={f}>
                {categories.map((c, i) => <CatBar key={i} {...c} compact f={f} />)}
              </Panel>
            </View>

            <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: f(13, 14), fontWeight: 'bold', color: C.noir }}>Qualité de l'aménagement</Text>
              </View>
              <Panel f={f}><Donut pct={conformite} compact f={f} t={t} /></Panel>
            </View>
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={{
          position: 'absolute', right: 20, bottom: 96, width: 54, height: 54, borderRadius: 27,
          backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center',
          shadowColor: C.noir, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 10,
        }}
        onPress={() => setFormVisible(true)}
      >
        <IconCamera />
      </TouchableOpacity>

      {overlays}
    </View>
  );
}

const mobileStyles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 26,
    fontWeight: '700',
    color: '#2E2A24',
  },
  headerSubtitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: '#7A7166',
    marginTop: 2,
  },
});
