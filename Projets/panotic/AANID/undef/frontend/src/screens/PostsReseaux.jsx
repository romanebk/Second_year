import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Modal, ScrollView, Alert, Dimensions, Image, Animated, RefreshControl, Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { listPosts, createPost, likePost, addComment } from '../services/postService';

const { width } = Dimensions.get('window');
const C = {
  primary: '#C19A6B', primaryDark: '#9C7C4F', secondary: '#8C6A43',
  background: '#F9F1E5', backgroundAlt: '#F2E7D3', surface: '#FFFFFF',
  text: '#2E2A24', textSecondary: '#7A7166', muted: '#A89E90',
  border: '#E8DCC8', success: '#6E8B5B', error: '#C75D4F', white: '#FFFFFF',
};

const THEMES = ['Tous', 'Environnement', 'Santé', 'Famille', 'Urbanisme'];
const VILLES = ['Toutes', 'Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Parakou', 'Lokossa', 'Ouidah'];
const ACCENTS = [C.primaryDark, C.error, C.success, '#D9A441', C.secondary, '#B08C5E'];

const GALLERY_IMAGES = [
  { id: 'g1', uri: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&q=80' },
  { id: 'g2', uri: 'https://images.unsplash.com/photo-1532375810709-75b2da00537c?w=400&q=80' },
  { id: 'g3', uri: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&q=80' },
  { id: 'g4', uri: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=80' },
  { id: 'g5', uri: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80' },
  { id: 'g6', uri: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80' },
  { id: 'g7', uri: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=400&q=80' },
  { id: 'g8', uri: 'https://images.unsplash.com/photo-1579003593419-98f949b3b859?w=400&q=80' },
  { id: 'g9', uri: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80' },
  { id: 'g10', uri: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&q=80' },
  { id: 'g11', uri: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=400&q=80' },
  { id: 'g12', uri: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&q=80' },
];


function PostCard({ item, onPress, onLike, index }) {
  const [liked, setLiked] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const lastTap = useRef(0);
  const [heartShow, setHeartShow] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: index * 80, useNativeDriver: false }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: index * 80, useNativeDriver: false }),
    ]).start();
  }, []);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 350) {
      if (!liked) {
        setLiked(true);
        onLike?.(item.id);
      }
      setHeartShow(true);
      setTimeout(() => setHeartShow(false), 600);
    }
    lastTap.current = now;
  };

  const ac = ACCENTS[index % ACCENTS.length];

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={cd.card}>
        <View style={cd.head}>
          <View style={cd.authorRow}>
            <View style={[cd.avatarRing, { borderColor: ac + '50' }]}>
              <View style={[cd.avatar, { backgroundColor: ac + '15' }]}>
                <Text style={[cd.avatarLetter, { color: ac }]}>{item.author[1]}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={cd.authorMeta}>
                <Text style={cd.authorName}>{item.author}</Text>
                <View style={[cd.themeBadge, { backgroundColor: ac + '12' }]}>
                  <View style={[cd.themeDot, { backgroundColor: ac }]} />
                  <Text style={[cd.themeText, { color: ac }]}>{item.theme}</Text>
                </View>
              </View>
              <Text style={cd.timeLoc}>{item.time} · {item.location}</Text>
            </View>
          </View>
        </View>

        <Text style={cd.body}>{item.text}</Text>

        {item.images?.length > 0 && (
          <TouchableOpacity activeOpacity={0.95} onPress={handleDoubleTap}>
            <View style={cd.imgBox}>
              <Image source={{ uri: item.images[0] }} style={cd.img} resizeMode="cover" />
              <View style={cd.imgOverlay} />
              <View style={cd.locBadge}>
                <Icon name="location-dot" size={11} color={C.white} />
                <Text style={cd.locBadgeText}>{item.location}</Text>
              </View>
              {heartShow && (
                <View style={cd.heartBurst}>
                  <Icon name="heart" size={72} color={C.white} solid />
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        <View style={cd.divider} />

        <View style={cd.actions}>
          <TouchableOpacity
            style={cd.actionBtn}
            onPress={() => { if (!liked) { setLiked(true); onLike?.(item.id); } }}
          >
            <Icon name="heart" size={17} color={liked ? C.error : C.textSecondary} solid={liked} />
            <Text style={[cd.actionCount, liked && cd.likedCount]}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cd.actionBtn} onPress={() => onPress(item)}>
            <Icon name="comment" size={17} color={C.textSecondary} />
            <Text style={cd.actionCount}>{item.comments.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cd.actionBtn}>
            <Icon name="share-nodes" size={17} color={C.textSecondary} />
            <Text style={cd.actionCount}>{item.shares}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cd.saveBtn}>
            <Icon name="bookmark" size={17} color={C.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const cd = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.text, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
    overflow: 'hidden',
  },
  head: { marginBottom: 10 },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  avatarRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 17, fontWeight: '700' },
  authorMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorName: { fontSize: 15, fontWeight: '700', color: C.text },
  themeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  themeDot: { width: 5, height: 5, borderRadius: 3 },
  themeText: { fontSize: 11, fontWeight: '600' },
  timeLoc: { fontSize: 12, color: C.muted, marginTop: 2 },
  body: { fontSize: 15, color: C.text, lineHeight: 24, letterSpacing: 0.1 },
  imgBox: { position: 'relative', marginTop: 14, borderRadius: 16, overflow: 'hidden' },
  img: { width: '100%', height: 240 },
  imgOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  locBadge: {
    position: 'absolute', bottom: 10, left: 12,
    backgroundColor: 'rgba(46,42,36,0.72)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  locBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  heartBurst: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  heartBurstText: { fontSize: 80 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginVertical: 14 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: { fontSize: 16 },
  actionCount: { fontSize: 13, color: C.textSecondary, fontWeight: '600' },
  likedCount: { color: C.error },
  saveBtn: { marginLeft: 'auto', opacity: 0.4 },
  saveIcon: { fontSize: 15 },
});

function StepDot({ step, current, label }) {
  const isActive = current >= step;
  const isNow = current === step;
  return (
    <View style={sd.row}>
      <View style={[sd.dot, isActive && sd.dotActive, isNow && sd.dotNow]}>
        <Icon
          name={isActive ? 'check' : 'circle'}
          size={isNow ? 11 : 10}
          color={isActive ? C.white : C.muted}
          solid={isNow}
        />
      </View>
      <Text style={[sd.label, isActive && sd.labelActive]}>{label}</Text>
    </View>
  );
}

const sd = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  dotActive: { backgroundColor: C.primary },
  dotNow: { backgroundColor: C.primaryDark, transform: [{ scale: 1.2 }] },
  dotText: { fontSize: 12, color: C.muted },
  dotTextActive: { color: '#FFF' },
  label: { fontSize: 12, color: C.muted, fontWeight: '500' },
  labelActive: { color: C.primaryDark, fontWeight: '600' },
});

export default function PostsReseaux({ author = '@Moi' }) {
  const [filterVille, setFilterVille] = useState('Toutes');
  const [filterTheme, setFilterTheme] = useState('Tous');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showPostDetail, setShowPostDetail] = useState(null);
  const [newPostText, setNewPostText] = useState('');
  const [newPostTheme, setNewPostTheme] = useState('Urbanisme');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [createStep, setCreateStep] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const loadPosts = async () => {
    try {
      setLoadError(null);
      setPosts(await listPosts());
    } catch {
      setLoadError('Impossible de charger le fil. Vérifiez votre connexion puis réessayez.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const filteredPosts = posts.filter(p => {
    if (filterVille !== 'Toutes' && p.ville !== filterVille) return false;
    if (filterTheme !== 'Tous' && p.theme !== filterTheme) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.text.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
    }
    return true;
  });

  const handleLike = async (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    try {
      const likes = await likePost(id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes } : p));
    } catch { /* le compteur optimiste reste affiché */ }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  // Import d'une photo locale (web uniquement) : lue en data URI, 1 Mo max
  const importLocalPhoto = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      Alert.alert('Bientôt disponible', "L'import de photos arrive prochainement sur mobile.");
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (file.size > 1_000_000) {
        Alert.alert('Image trop lourde', 'Choisissez une image de 1 Mo maximum.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedMedia(prev => {
          if (prev.length >= 6) { Alert.alert('Limite', '6 photos max.'); return prev; }
          return [...prev, { id: `local-${Date.now()}`, uri: String(reader.result) }];
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const toggleMedia = (img) => {
    setSelectedMedia(prev => {
      const exists = prev.find(p => p.id === img.id);
      if (exists) return prev.filter(p => p.id !== img.id);
      if (prev.length >= 6) { Alert.alert('Limite', '6 photos max.'); return prev; }
      return [...prev, { ...img }];
    });
  };

  const handlePublish = async () => {
    if (!newPostText.trim() && selectedMedia.length === 0) {
      Alert.alert('Contenu requis', 'Ajoutez du texte ou une photo.');
      return;
    }
    try {
      const created = await createPost({
        text: newPostText || 'Nouvelle publication',
        author,
        location: 'Cotonou',
        theme: newPostTheme,
        ville: 'Cotonou',
        image: selectedMedia[0]?.uri || null,
      });
      setPosts(prev => [{
        ...created,
        images: selectedMedia.length ? selectedMedia.map(m => m.uri) : created.images,
      }, ...prev]);
      setNewPostText(''); setSelectedMedia([]); setShowCreatePost(false); setCreateStep(1);
    } catch (e) {
      Alert.alert('Publication impossible', e.message || 'Veuillez réessayer.');
    }
  };

  return (
    <View style={s.root}>
      <FlatList
        style={s.list}
        data={filteredPosts}
        renderItem={({ item, index }) => (
          <PostCard item={item} index={index} onPress={setShowPostDetail} onLike={handleLike} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
            colors={[C.primary, C.success]}
            progressBackgroundColor={C.surface}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={s.hero}>
              <View style={s.heroPreRow}>
                <Icon name="newspaper" size={12} color={C.primaryDark} />
                <Text style={s.heroPre}>Fil d'actualité</Text>
              </View>
              <Text style={s.heroTitle}>Posts & Réseaux</Text>
              <View style={s.heroStats}>
                <View style={s.heroStat}>
                  <Text style={s.heroStatNum}>{posts.length}</Text>
                  <Text style={s.heroStatLabel}>posts</Text>
                </View>
                <View style={s.heroStatDiv} />
                <View style={s.heroStat}>
                  <Text style={s.heroStatNum}>{VILLES.length - 1}</Text>
                  <Text style={s.heroStatLabel}>villes</Text>
                </View>
                <View style={s.heroStatDiv} />
                <View style={s.heroStat}>
                  <Text style={s.heroStatNum}>{THEMES.length - 1}</Text>
                  <Text style={s.heroStatLabel}>thèmes</Text>
                </View>
              </View>
            </View>

            <View style={s.searchRow}>
              <View style={s.searchWrap}>
                <Icon name="magnifying-glass" size={14} color={C.muted} style={s.searchIcon} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Rechercher par ville, thème..."
                  placeholderTextColor="rgba(0,0,0,0.22)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={s.filterBtn} onPress={() => setShowFilters(v => !v)}>
                  <Icon name="sliders" size={17} color={showFilters ? C.primaryDark : C.muted} />
                </TouchableOpacity>
              </View>
            </View>

            {showFilters && (
              <View style={s.filtersWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {VILLES.map(v => (
                    <TouchableOpacity key={v} style={[s.chip, filterVille === v && s.chipOn]} onPress={() => setFilterVille(v)}>
                      <Text style={[s.chipText, filterVille === v && s.chipTextOn]}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  {THEMES.map(t => (
                    <TouchableOpacity key={t} style={[s.chip, filterTheme === t && s.chipOn]} onPress={() => setFilterTheme(t)}>
                      <Text style={[s.chipText, filterTheme === t && s.chipTextOn]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyGlow}><Icon name="earth-africa" size={34} color={C.primaryDark} /></View>
            <Text style={s.emptyTitle}>{loadError ? 'Connexion impossible' : 'Aucun post trouvé'}</Text>
            <Text style={s.emptyDesc}>{loadError || "Modifie tes filtres ou explore d'autres villes du Bénin."}</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => { setFilterVille('Toutes'); setFilterTheme('Tous'); setSearchQuery(''); loadPosts(); }}>
              <Text style={s.emptyBtnText}>{loadError ? 'Réessayer' : 'Réinitialiser'}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity style={s.fab} onPress={() => setShowCreatePost(true)} activeOpacity={0.85}>
        <View style={s.fabInner}><Icon name="plus" size={22} color={C.white} /></View>
      </TouchableOpacity>

      {/* ─── CREATE POST ─── */}
      <Modal visible={showCreatePost} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHandle} />
            <View style={s.modalHead}>
              <TouchableOpacity onPress={() => { setShowCreatePost(false); setSelectedMedia([]); setNewPostText(''); setCreateStep(1); }}>
                <Text style={s.modalCancel}>Annuler</Text>
              </TouchableOpacity>
              <Text style={s.modalTitle}>Nouveau post</Text>
              <TouchableOpacity
                style={[s.publishBtn, (selectedMedia.length === 0 && !newPostText.trim()) && s.dim]}
                onPress={handlePublish}
              >
                <Text style={s.publishBtnText}>Partager</Text>
              </TouchableOpacity>
            </View>

            <View style={s.stepsBar}>
              <StepDot step={1} current={createStep} label="Média" />
              <View style={s.stepsDash} />
              <StepDot step={2} current={createStep} label="Légende" />
              <View style={s.stepsDash} />
              <StepDot step={3} current={createStep} label="Publier" />
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {selectedMedia.length > 0 ? (
                <View style={cp.previewWrap}>
                  <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                    {selectedMedia.map((m, i) => (
                      <View key={m.id} style={cp.previewPage}>
                        <Image source={{ uri: m.uri }} style={cp.previewImg} resizeMode="cover" />
                        <TouchableOpacity style={cp.removeBtn} onPress={() => setSelectedMedia(prev => prev.filter(p => p.id !== m.id))}>
                          <Icon name="xmark" size={14} color={C.white} />
                        </TouchableOpacity>
                        <View style={cp.counterBadge}><Text style={cp.counterText}>{i + 1}/{selectedMedia.length}</Text></View>
                      </View>
                    ))}
                  </ScrollView>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={cp.thumbRow}>
                    {selectedMedia.map(m => <Image key={m.id} source={{ uri: m.uri }} style={cp.thumb} resizeMode="cover" />)}
                    <TouchableOpacity style={cp.addMore} onPress={() => setShowMediaPicker(true)}>
                      <Icon name="plus" size={16} color={C.white} />
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              ) : (
                <TouchableOpacity style={cp.addMedia} onPress={() => setShowMediaPicker(true)}>
                  <View style={cp.addMediaCircle}><Icon name="camera" size={24} color={C.primaryDark} /></View>
                  <Text style={cp.addMediaTitle}>Ajouter des photos</Text>
                  <Text style={cp.addMediaSub}>Jusqu'à 6 photos · Galerie</Text>
                </TouchableOpacity>
              )}

              <View style={cp.captionRow}>
                <View style={cp.captionAvatar}><Text style={cp.captionAvatarText}>M</Text></View>
                <TextInput
                  style={cp.captionInput}
                  placeholder="Écris une légende..."
                  placeholderTextColor="rgba(0,0,0,0.2)"
                  multiline value={newPostText}
                  onChangeText={setNewPostText}
                  maxLength={500}
                  onFocus={() => setCreateStep(2)}
                />
              </View>

              <View style={cp.options}>
                <View style={cp.optRow}>
                  <View style={cp.optLabelRow}><Icon name="location-dot" size={14} color={C.primaryDark} /><Text style={cp.optLabel}>Localisation</Text></View>
                  <Text style={cp.optValue}>Cotonou, Bénin</Text>
                </View>
                <View style={cp.optDiv} />
                <View style={cp.optRow}>
                  <View style={cp.optLabelRow}><Icon name="tag" size={14} color={C.primaryDark} /><Text style={cp.optLabel}>Thème</Text></View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {THEMES.filter(t => t !== 'Tous').map(t => (
                      <TouchableOpacity key={t} style={[cp.themeChip, newPostTheme === t && cp.themeChipOn]} onPress={() => setNewPostTheme(t)}>
                        <Text style={[cp.themeChipText, newPostTheme === t && cp.themeChipTextOn]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={cp.optDiv} />
                <View style={cp.optRow}>
                  <View style={cp.optLabelRow}><Icon name="lock" size={14} color={C.primaryDark} /><Text style={cp.optLabel}>Visibilité</Text></View>
                  <Text style={cp.optValue}>Public</Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[cp.publishBar, (selectedMedia.length === 0 && !newPostText.trim()) && s.dim]}
              onPress={handlePublish}
            >
              <Text style={cp.publishBarText}>
                {selectedMedia.length > 0 ? `Publier ${selectedMedia.length} photo${selectedMedia.length > 1 ? 's' : ''}` : 'Publier'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── MEDIA PICKER ─── */}
      <Modal visible={showMediaPicker} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={[s.modal, { maxHeight: '90%' }]}>
            <View style={s.modalHandle} />
            <View style={s.modalHead}>
              <TouchableOpacity onPress={() => setShowMediaPicker(false)}><Text style={s.modalCancel}>Annuler</Text></TouchableOpacity>
              <Text style={s.modalTitle}>Galerie</Text>
              <TouchableOpacity onPress={() => { setCreateStep(1); setShowMediaPicker(false); }}>
                <Text style={[s.modalCancel, { fontWeight: '600' }]}>OK</Text>
              </TouchableOpacity>
            </View>
            <View style={gp.stats}>
              <Text style={gp.statsText}>{selectedMedia.length} sélectionnée{selectedMedia.length > 1 ? 's' : ''}</Text>
              <TouchableOpacity style={gp.importBtn} onPress={importLocalPhoto}>
                <Icon name="arrow-up-from-bracket" size={12} color={C.primaryDark} />
                <Text style={gp.importBtnText}>Importer une photo</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={GALLERY_IMAGES} numColumns={3}
              renderItem={({ item }) => {
                const sel = selectedMedia.find(p => p.id === item.id);
                return (
                  <TouchableOpacity style={gp.item} onPress={() => toggleMedia(item)}>
                    <Image source={{ uri: item.uri }} style={gp.img} resizeMode="cover" />
                    {sel && (
                      <View style={gp.overlay}>
                        <View style={gp.check}><Icon name="check" size={13} color={C.white} /></View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              keyExtractor={item => item.id}
            />
          </View>
        </View>
      </Modal>

      {/* ─── POST DETAIL ─── */}
      <Modal visible={!!showPostDetail} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={[s.modal, { maxHeight: '94%' }]}>
            <View style={s.modalHandle} />
            <View style={s.modalHead}>
              <TouchableOpacity style={s.backRow} onPress={() => setShowPostDetail(null)}>
                <Icon name="arrow-left" size={14} color={C.textSecondary} />
                <Text style={s.modalCancel}>Retour</Text>
              </TouchableOpacity>
              <Text style={s.modalTitle}>Publication</Text>
              <TouchableOpacity onPress={() => Alert.alert('Options', 'Signaler · Partager · Copier')}>
                <Icon name="ellipsis" size={16} color={C.textSecondary} />
              </TouchableOpacity>
            </View>
            {showPostDetail && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={s.detailHead}>
                  <View style={[s.detailRing, { borderColor: ACCENTS[0] + '50' }]}>
                    <View style={[s.detailAvatar, { backgroundColor: ACCENTS[0] + '15' }]}>
                      <Text style={[s.detailAvatarText, { color: ACCENTS[0] }]}>{showPostDetail.author[1]}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.detailAuthor}>{showPostDetail.author}</Text>
                    <Text style={s.detailMeta}>{showPostDetail.time} · {showPostDetail.location}</Text>
                  </View>
                  <View style={[s.detailBadge, { backgroundColor: ACCENTS[0] + '12' }]}>
                    <Text style={[s.detailBadgeText, { color: ACCENTS[0] }]}>{showPostDetail.theme}</Text>
                  </View>
                </View>
                <Text style={s.detailBody}>{showPostDetail.text}</Text>
                {showPostDetail.images?.length > 0 && (
                  <View style={s.detailImgWrap}>
                    <Image source={{ uri: showPostDetail.images[0] }} style={s.detailImg} resizeMode="cover" />
                    <View style={s.detailImgOverlay} />
                    <View style={s.detailLocBadge}><Icon name="location-dot" size={11} color={C.white} /><Text style={s.detailLocBadgeText}>{showPostDetail.location}</Text></View>
                  </View>
                )}
                <View style={s.detailDiv} />
                <View style={s.detailActions}>
                  {['heart', 'comment', 'share-nodes'].map((iconName, i) => (
                    <TouchableOpacity key={i} style={s.detailAction}>
                      <Icon name={iconName} size={17} color={C.textSecondary} />
                      <Text style={s.detailActionCount}>{[showPostDetail.likes, showPostDetail.comments.length, showPostDetail.shares][i]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={s.commentsSection}>
                  <Text style={s.commentsTitle}>Commentaires ({showPostDetail.comments.length})</Text>
                  {showPostDetail.comments.length === 0 && (
                    <Text style={s.commentEmpty}>Aucun commentaire pour le moment. Lancez la discussion !</Text>
                  )}
                  {showPostDetail.comments.map((c, i) => (
                    <View key={c.id || i} style={s.comment}>
                      <View style={[s.commentAvatar, { backgroundColor: ACCENTS[i % ACCENTS.length] + '15' }]}>
                        <Text style={[s.commentAvatarText, { color: ACCENTS[i % ACCENTS.length] }]}>{(c.author || '@?')[1]}</Text>
                      </View>
                      <View style={s.commentBody}>
                        <View style={s.commentHead}>
                          <Text style={s.commentAuthor}>{c.author}</Text>
                        </View>
                        <Text style={s.commentText}>{c.text}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
            {showPostDetail && (
              <View style={s.commentInput}>
                <TextInput
                  style={s.commentInputField}
                  placeholder="Écrire un commentaire..."
                  placeholderTextColor="rgba(0,0,0,0.25)"
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <TouchableOpacity
                  style={[s.commentSend, !commentText.trim() && s.dim]}
                  onPress={async () => {
                    if (!commentText.trim()) return;
                    try {
                      const { comment } = await addComment(showPostDetail.id, { text: commentText.trim(), author });
                      const updated = { ...showPostDetail, comments: [...showPostDetail.comments, comment] };
                      setShowPostDetail(updated);
                      setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
                      setCommentText('');
                    } catch (e) {
                      Alert.alert('Commentaire non envoyé', e.message || 'Veuillez réessayer.');
                    }
                  }}
                >
                  <Icon name="paper-plane" size={15} color={C.white} solid />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  dim: { opacity: 0.4 },
  list: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 120 },
  hero: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  heroPreRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  heroPre: { fontSize: 12, fontWeight: '600', color: C.primaryDark, letterSpacing: 1.2 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: C.text, letterSpacing: -0.6 },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 14, backgroundColor: C.surface, borderRadius: 16, padding: 16, alignSelf: 'flex-start', borderWidth: 1, borderColor: C.border },
  heroStat: { alignItems: 'center', paddingHorizontal: 12 },
  heroStatDiv: { width: 1, height: 28, backgroundColor: 'rgba(0,0,0,0.06)' },
  heroStatNum: { fontSize: 19, fontWeight: '800', color: C.text },
  heroStatLabel: { fontSize: 11, color: C.muted, fontWeight: '500', marginTop: 2 },
  searchRow: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 16, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: C.border },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: C.text, outlineStyle: 'none' },
  filterBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginRight: -10 },
  filterIcon: { fontSize: 18, color: '#B0A89A' },
  filtersWrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, backgroundColor: C.surface, marginRight: 8, borderWidth: 1, borderColor: C.border },
  chipOn: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
  chipTextOn: { color: '#FFF' },
  fab: { position: 'absolute', bottom: 28, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: C.primaryDark, shadowColor: C.text, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.24, shadowRadius: 16, elevation: 8, justifyContent: 'center', alignItems: 'center' },
  fabInner: { justifyContent: 'center', alignItems: 'center' },
  fabIcon: { fontSize: 30, color: '#FFF', fontWeight: '300', marginTop: -2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 40 },
  emptyGlow: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(193,154,107,0.14)', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  emptyIcon: { fontSize: 36, opacity: 0.3 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22 },
  emptyBtn: { marginTop: 20, backgroundColor: C.primaryDark, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: C.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '92%', paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center', marginBottom: 16 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  modalCancel: { fontSize: 15, color: C.textSecondary, fontWeight: '500' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  publishBtn: { backgroundColor: C.primaryDark, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  publishBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  stepsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  stepsDash: { width: 30, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  detailRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  detailAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  detailAvatarText: { fontSize: 17, fontWeight: '700' },
  detailAuthor: { fontSize: 15, fontWeight: '700', color: C.text },
  detailMeta: { fontSize: 12, color: C.muted, marginTop: 1 },
  detailBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  detailBadgeText: { fontSize: 12, fontWeight: '600' },
  detailBody: { fontSize: 15, color: C.text, lineHeight: 24, marginBottom: 14 },
  detailImgWrap: { position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  detailImg: { width: '100%', height: 280 },
  detailImgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', backgroundColor: 'rgba(0,0,0,0.2)' },
  detailLocBadge: { position: 'absolute', bottom: 10, left: 12, backgroundColor: 'rgba(46,42,36,0.72)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailLocBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  detailDiv: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginVertical: 16 },
  detailActions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  detailAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailActionIcon: { fontSize: 16 },
  detailActionCount: { fontSize: 13, color: C.textSecondary, fontWeight: '600' },
  commentsSection: { marginTop: 24 },
  commentsTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 14 },
  commentEmpty: { fontSize: 13, color: C.muted, marginBottom: 10 },
  comment: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { fontSize: 14, fontWeight: '600' },
  commentBody: { flex: 1, backgroundColor: C.backgroundAlt, borderRadius: 14, padding: 12 },
  commentHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: C.text },
  commentTime: { fontSize: 11, color: C.muted },
  commentText: { fontSize: 14, color: C.textSecondary, lineHeight: 20 },
  commentActions: { flexDirection: 'row', gap: 14, marginTop: 6 },
  commentLike: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentAction: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },
  commentInput: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8, backgroundColor: C.surface, borderRadius: 16, padding: 6, borderWidth: 1, borderColor: C.border },
  commentInputField: { flex: 1, fontSize: 14, color: C.text, paddingHorizontal: 12, paddingVertical: 8 },
  commentSend: { backgroundColor: C.primaryDark, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11 },
  commentSendText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});

const cp = StyleSheet.create({
  previewWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, backgroundColor: '#000' },
  previewPage: { width: width - 48, height: width - 48, position: 'relative' },
  previewImg: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  removeBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  counterBadge: { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  counterText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  thumbRow: { flexDirection: 'row', padding: 8, gap: 6 },
  thumb: { width: 40, height: 40, borderRadius: 6 },
  addMore: { width: 40, height: 40, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  addMoreIcon: { color: '#FFF', fontSize: 20, fontWeight: '300' },
  addMedia: { backgroundColor: C.surface, borderRadius: 20, borderWidth: 2, borderColor: C.border, borderStyle: 'dashed', padding: 40, alignItems: 'center', marginBottom: 16 },
  addMediaCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.backgroundAlt, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  addMediaIcon: { fontSize: 26 },
  addMediaTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 4 },
  addMediaSub: { fontSize: 13, color: C.muted },
  captionRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 16 },
  captionAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.backgroundAlt, justifyContent: 'center', alignItems: 'center' },
  captionAvatarText: { fontSize: 14, fontWeight: '700', color: C.text },
  captionInput: { flex: 1, fontSize: 15, color: C.text, lineHeight: 22, maxHeight: 100, paddingTop: 6 },
  options: { backgroundColor: C.surface, borderRadius: 16, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  optRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  optLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  optLabel: { fontSize: 15, color: C.text },
  optValue: { fontSize: 14, color: C.primaryDark, fontWeight: '500' },
  optDiv: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginHorizontal: 16 },
  themeChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: C.backgroundAlt, marginLeft: 6, borderWidth: 1, borderColor: C.border },
  themeChipOn: { backgroundColor: C.primary, borderColor: C.primary },
  themeChipText: { fontSize: 12, color: C.textSecondary, fontWeight: '500' },
  themeChipTextOn: { color: '#FFF' },
  publishBar: { backgroundColor: C.primaryDark, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  publishBarText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

const gp = StyleSheet.create({
  stats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, paddingBottom: 12 },
  statsText: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
  importBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.backgroundAlt, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  importBtnText: { fontSize: 12, color: C.primaryDark, fontWeight: '700' },
  item: { width: (width - 48 - 16) / 3, height: (width - 48 - 16) / 3, margin: 2, borderRadius: 8, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(156,124,79,0.32)', justifyContent: 'center', alignItems: 'center' },
  check: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.primaryDark, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: C.white },
  checkText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
