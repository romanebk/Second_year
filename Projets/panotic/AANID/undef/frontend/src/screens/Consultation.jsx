import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, Alert, SafeAreaView, KeyboardAvoidingView,
  Platform, Animated, Dimensions, StatusBar, Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { submitConsultationRequest } from '../services/consultationService';

const { width } = Dimensions.get('window');
const C = {
  primary: '#C19A6B', primaryDark: '#9C7C4F', secondary: '#8C6A43', secondaryDark: '#6E5333',
  background: '#F9F1E5', backgroundAlt: '#F2E7D3', surface: '#FFFFFF',
  text: '#2E2A24', textSecondary: '#7A7166', muted: '#A89E90',
  border: '#E8DCC8', success: '#6E8B5B', error: '#C75D4F', white: '#FFFFFF',
};

const SERVICES = [
  {
    id: '1', icon: 'chart-column', title: 'Études panneautique',
    short: 'Analyse complète de l\'état de votre panneautique urbaine.',
    desc: 'Diagnostic approfondi de l\'affichage publicitaire. Notre équipe réalise un état des lieux complet et vous livre des recommandations actionnables, avec cartographie et rapport détaillé.',
    features: ['Cartographie précise des panneaux', 'Conformité aux normes', 'Recommandations stratégiques', 'Rapport PDF + données brutes'],
    color: C.primaryDark, price: 'Sur devis',
  },
  {
    id: '2', icon: 'rotate', title: 'Réforme publicitaire',
    short: 'Diagnostic et stratégies pour réformer l\'exploitation.',
    desc: 'Accompagnement sur mesure pour moderniser la réglementation et l\'exploitation des panneaux publicitaires dans votre région, de l\'audit à la mise en œuvre.',
    features: ['Audit réglementaire complet', 'Nouvelles stratégies', 'Plans d\'action détaillés', 'Suivi de mise en œuvre'],
    color: C.success, price: 'À partir de 1.5M FCFA',
  },
  {
    id: '3', icon: 'chart-line', title: 'Études de marché',
    short: 'Analyse du potentiel et positionnement concurrentiel.',
    desc: 'Évaluations précises du marché publicitaire local pour optimiser votre développement, votre tarification et votre positionnement stratégique.',
    features: ['Analyse concurrentielle', 'Potentiel publicitaire', 'Étude tarifaire', 'Tendances et opportunités'],
    color: '#D9A441', price: 'À partir de 800k FCFA',
  },
];

const CLIENT_TYPES = ['Collectivité', 'Régie', 'Agence', 'Investisseur', 'Gouvernement', 'Entreprise'];

const PROCESS_STEPS = [
  { step: '01', title: 'Prise de contact', desc: 'Vous nous exposez votre besoin en quelques clics.' },
  { step: '02', title: 'Diagnostic gratuit', desc: 'Nous analysons votre situation et vous adressons un devis.' },
  { step: '03', title: 'Livraison des résultats', desc: 'Rapport complet, cartographie et recommandations actionnables.' },
];

const TESTIMONIALS = [
  { text: 'Le diagnostic panneautique nous a permis de rationaliser notre affichage de 40%.', author: 'Mairie de Cotonou', role: 'Direction de l\'Urbanisme' },
  { text: 'Une équipe d\'experts qui connaît parfaitement les réalités du terrain béninois.', author: 'Régie Pub Ouest', role: 'Directeur général' },
];

function useAnimatedValue(initial = 0) {
  return useRef(new Animated.Value(initial)).current;
}

function SectionLabel({ children }) {
  return (
    <View style={sl.row}>
      <Icon name="caret-down" size={12} color={C.primaryDark} />
      <Text style={sl.text}>{children}</Text>
    </View>
  );
}

const sl = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  text: { fontSize: 12, fontWeight: '700', color: C.text, letterSpacing: 1 },
});

function FloatingInput({ label, value, onChangeText, placeholder, error, ...props }) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const hasValue = value && value.length > 0;

  useEffect(() => {
    Animated.timing(anim, { toValue: focused || hasValue ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [focused, hasValue]);

  const labelStyle = {
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] }),
    color: anim.interpolate({ inputRange: [0, 1], outputRange: [C.muted, C.primaryDark] }),
  };

  return (
    <Animated.View style={[fi.wrap, focused && fi.wrapFocused, error && fi.wrapError]}>
      <Animated.Text style={[fi.label, labelStyle]}>{label}</Animated.Text>
      <TextInput
        style={fi.input}
        placeholder={focused ? placeholder : ''}
        placeholderTextColor={C.muted}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {focused && <View style={fi.focusLine} />}
      {error && <Text style={fi.errorText}>{error}</Text>}
    </Animated.View>
  );
}

const fi = StyleSheet.create({
  wrap: {
    backgroundColor: C.surface,
    borderRadius: 14, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 6,
    borderWidth: 1, borderColor: C.border,
    marginBottom: 14, overflow: 'hidden',
  },
  wrapFocused: {
    borderColor: C.primary,
    shadowColor: C.primaryDark, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 1,
  },
  wrapError: { borderColor: C.error },
  label: { position: 'absolute', left: 16, fontWeight: '500' },
  input: { fontSize: 15, color: C.text, paddingVertical: 8, outlineStyle: 'none', marginTop: 4 },
  focusLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
    backgroundColor: C.primary, opacity: 0.3,
  },
  errorText: { fontSize: 11, color: C.error, fontWeight: '500', marginTop: 2 },
});

function AnimatedNumber({ n, suffix = '' }) {
  const val = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    Animated.timing(val, { toValue: n, duration: 1200, useNativeDriver: false }).start();
    const listener = val.addListener(({ value }) => {
      setDisplay(String(Math.round(value)));
    });
    return () => val.removeListener(listener);
  }, [n]);

  return <Text style={s.statNum}>{display}{suffix}</Text>;
}

function ServiceCard({ service, onPress, index }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, friction: 7, tension: 50, delay: index * 120, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }, { scale }] }}>
      <TouchableOpacity style={sc.card} activeOpacity={0.93} onPress={() => onPress(service)}>
        <View style={[sc.accentBar, { backgroundColor: service.color }]} />
        <View style={sc.body}>
          <View style={[sc.iconWrap, { backgroundColor: service.color + '12' }]}>
            <Icon name={service.icon} size={22} color={service.color} />
          </View>
          <View style={sc.priceBadge}>
            <Text style={[sc.priceText, { color: service.color }]}>{service.price}</Text>
          </View>
          <Text style={sc.title}>{service.title}</Text>
          <Text style={sc.desc}>{service.short}</Text>
          <View style={sc.linkRow}>
            <Text style={[sc.link, { color: service.color }]}>En savoir plus</Text>
            <Icon name="arrow-right" size={12} color={service.color} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const sc = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16, marginBottom: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.text, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  accentBar: { height: 4 },
  body: { padding: 22 },
  iconWrap: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  icon: { fontSize: 22 },
  priceBadge: {
    position: 'absolute', top: 22, right: 22,
    backgroundColor: C.background,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: C.border,
  },
  priceText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 8 },
  desc: { fontSize: 14, color: C.textSecondary, lineHeight: 21, marginBottom: 14 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  link: { fontSize: 14, fontWeight: '600' },
  arrow: { fontSize: 16, fontWeight: '600', marginTop: -1 },
});

function ProcessStepCard({ stepData, index }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, delay: index * 150, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
      <View style={ps.card}>
        <Text style={ps.stepNum}>{stepData.step}</Text>
        <Text style={ps.title}>{stepData.title}</Text>
        <Text style={ps.desc}>{stepData.desc}</Text>
      </View>
      {index < PROCESS_STEPS.length - 1 && <View style={ps.connector} />}
    </Animated.View>
  );
}

const ps = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: C.border,
    marginBottom: 0,
  },
  stepNum: { fontSize: 32, fontWeight: '800', color: 'rgba(0,0,0,0.04)', marginBottom: 4, letterSpacing: -1 },
  title: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 6 },
  desc: { fontSize: 13, color: C.textSecondary, lineHeight: 20 },
  connector: { width: 1, height: 24, backgroundColor: 'rgba(0,0,0,0.06)', alignSelf: 'center' },
});

function TestimonialCard({ t, index }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, delay: index * 200, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ scale: anim }] }}>
      <View style={tc.card}>
        <Icon name="quote-left" size={20} color={C.primaryDark} style={tc.quote} />
        <Text style={tc.text}>{t.text}</Text>
        <View style={tc.authorRow}>
          <View style={tc.avatar}><Text style={tc.avatarText}>{t.author[0]}</Text></View>
          <View>
            <Text style={tc.author}>{t.author}</Text>
            <Text style={tc.role}>{t.role}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const tc = StyleSheet.create({
  card: {
    backgroundColor: C.surface, borderRadius: 16, padding: 22,
    borderWidth: 1, borderColor: C.border,
    marginBottom: 12,
    shadowColor: C.text, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  quote: { marginBottom: 10, opacity: 0.35 },
  text: { fontSize: 14, color: C.textSecondary, lineHeight: 22, fontStyle: 'italic', marginBottom: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primaryDark, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  author: { fontSize: 13, fontWeight: '700', color: C.text },
  role: { fontSize: 11, color: C.muted, marginTop: 1 },
});

export default function Consultation() {
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [serviceType, setServiceType] = useState('');
  const [clientType, setClientType] = useState('');
  const [ville, setVille] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [nom, setNom] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const heroAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const heroParallax = scrollY.interpolate({
    inputRange: [0, 200], outputRange: [0, 60], extrapolate: 'clamp',
  });
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 120], outputRange: [1, 0.6], extrapolate: 'clamp',
  });

  useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!serviceType) newErrors.serviceType = 'Sélectionnez un service';
      if (!clientType) newErrors.clientType = 'Sélectionnez votre profil';
      if (!ville.trim()) newErrors.ville = 'Indiquez une ville';
    }
    if (step === 2) {
      if (!description.trim()) newErrors.description = 'Décrivez votre besoin';
      if (!email.trim()) newErrors.email = 'Email requis';
      if (!telephone.trim()) newErrors.telephone = 'Téléphone requis';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(prev => prev + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    setFormStep(prev => prev - 1);
    setErrors({});
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setSubmitting(true);
    try {
      await submitConsultationRequest({
        serviceType,
        clientType,
        ville: ville.trim(),
        description: description.trim(),
        budget: budget.trim() || null,
        nom: nom.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
      });
      setSubmitted(true);
    } catch (e) {
      Alert.alert('Envoi impossible', e.message || 'Vérifiez votre connexion puis réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setServiceType(''); setClientType(''); setVille('');
    setDescription(''); setBudget(''); setEmail('');
    setTelephone(''); setNom(''); setSubmitted(false);
    setShowForm(false); setFormStep(1); setErrors({});
  };

  const openFormWithService = (service) => {
    setServiceType(service?.title || '');
    setSelectedService(null);
    setFormStep(1);
    setShowForm(true);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.ScrollView
          style={s.container}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
        >
          {/* Hero */}
          <Animated.View style={[s.hero, { opacity: heroOpacity }]}>
            <View style={s.heroBadge}>
              <View style={s.heroBadgeDot} />
              <Text style={s.heroBadgeText}>Service professionnel</Text>
              <View style={s.heroBadgeDiv} />
              <Text style={s.heroBadgeText}>Rép. du Bénin</Text>
            </View>
            <Text style={s.heroTitle}>
              Conseil &{'\n'}Expertise{'\n'}panneautique.
            </Text>
            <Text style={s.heroDesc}>
              Études, réformes et analyses de marché pour transformer l'affichage publicitaire de votre territoire.
            </Text>
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                style={s.heroBtn}
                onPress={() => {
                  Animated.sequence([
                    Animated.timing(btnScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
                    Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
                  ]).start();
                  setShowForm(true);
                }}
                activeOpacity={0.9}
              >
                <Text style={s.heroBtnText}>Demander une étude</Text>
                <Icon name="arrow-right" size={16} color={C.white} />
              </TouchableOpacity>
            </Animated.View>
            <View style={s.heroMeta}>
              <Text style={s.heroMetaText}>Réponse sous 48h</Text>
              <View style={s.heroMetaDot} />
              <Text style={s.heroMetaText}>Devis gratuit</Text>
              <View style={s.heroMetaDot} />
              <Text style={s.heroMetaText}>Experts agréés</Text>
            </View>
          </Animated.View>

          {/* Stats */}
          <View style={s.section}>
            <SectionLabel>Chiffres clés</SectionLabel>
            <View style={s.statsGrid}>
              {[
                { num: 50, suffix: '+', label: 'Études réalisées' },
                { num: 98, suffix: '%', label: 'Clients satisfaits' },
                { num: 15, suffix: '', label: 'Experts dédiés' },
                { num: 48, suffix: 'h', label: 'Délai de réponse' },
              ].map((st, i) => (
                <View key={i} style={s.statCard}>
                  <Text style={s.statNum}>
                    <AnimatedNumber n={st.num} suffix={st.suffix} />
                  </Text>
                  <Text style={s.statLabel}>{st.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Services */}
          <View style={s.section}>
            <View style={s.sectionHead}>
              <SectionLabel>Nos services</SectionLabel>
              <TouchableOpacity style={s.sectionActionRow}><Text style={s.sectionAction}>Tout voir</Text><Icon name="arrow-right" size={11} color={C.primaryDark} /></TouchableOpacity>
            </View>
            {SERVICES.map((svc, i) => (
              <ServiceCard key={svc.id} service={svc} index={i} onPress={setSelectedService} />
            ))}
          </View>

          {/* How it works */}
          <View style={s.section}>
            <SectionLabel>Comment ça marche</SectionLabel>
            <View style={s.processRow}>
              {PROCESS_STEPS.map((step, i) => (
                <ProcessStepCard key={step.step} stepData={step} index={i} />
              ))}
            </View>
          </View>

          {/* Clients */}
          <View style={s.section}>
            <SectionLabel>Clientèle</SectionLabel>
            <View style={s.tagRow}>
              {CLIENT_TYPES.map(ct => (
                <View key={ct} style={s.tag}>
                  <Text style={s.tagText}>{ct}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Testimonials */}
          <View style={s.section}>
            <SectionLabel>Témoignages</SectionLabel>
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} t={t} index={i} />
            ))}
          </View>

          {/* Trust */}
          <View style={s.section}>
            <SectionLabel>Ils nous font confiance</SectionLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.trustRow}>
              {['ANCB', 'Mairie Cotonou', 'Régie Pub', 'Min. Communication', 'CCIB'].map((name, i) => (
                <View key={i} style={s.trustBadge}>
                  <Text style={s.trustBadgeText}>{name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* CTA */}
          <View style={[s.section, { paddingBottom: 120 }]}>
            <TouchableOpacity style={s.ctaCard} onPress={() => setShowForm(true)} activeOpacity={0.93}>
              <Icon name="wand-magic-sparkles" size={28} color="rgba(255,255,255,0.25)" style={s.ctaGlow} />
              <Text style={s.ctaTitle}>Prêt à moderniser{'\n'}votre panneautique ?</Text>
              <Text style={s.ctaDesc}>Contactez nos experts dès aujourd'hui. Devis gratuit sous 48h.</Text>
              <View style={s.ctaBtn}>
                <View style={s.ctaBtnRow}><Text style={s.ctaBtnText}>Démarrer</Text><Icon name="arrow-right" size={14} color={C.text} /></View>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>

        {/* Detail Modal */}
        <Modal visible={!!selectedService} animationType="slide" transparent>
          <View style={s.overlay}>
            <View style={s.modal}>
              <View style={s.modalHandle} />
              <View style={s.modalHead}>
                <TouchableOpacity style={s.backRow} onPress={() => setSelectedService(null)}>
                  <Icon name="arrow-left" size={14} color={C.textSecondary} />
                  <Text style={s.modalCancel}>Retour</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedService(null)}>
                  <Icon name="xmark" size={18} color={C.textSecondary} />
                </TouchableOpacity>
              </View>
              {selectedService && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={[s.detailIconWrap, { backgroundColor: selectedService.color + '12' }]}>
                    <Icon name={selectedService.icon} size={26} color={selectedService.color} />
                  </View>
                  <View style={s.detailPriceRow}>
                    <Text style={[s.detailPrice, { color: selectedService.color }]}>{selectedService.price}</Text>
                  </View>
                  <Text style={s.detailTitle}>{selectedService.title}</Text>
                  <Text style={s.detailDesc}>{selectedService.desc}</Text>
                  <View style={s.detailDivider} />
                  <Text style={s.detailSub}>Ce que nous livrons</Text>
                  {selectedService.features.map((f, i) => (
                    <View key={i} style={s.featureRow}>
                      <View style={[s.featureDot, { backgroundColor: selectedService.color }]} />
                      <Text style={s.featureText}>{f}</Text>
                    </View>
                  ))}
                  <View style={s.detailActions}>
                    <TouchableOpacity
                      style={[s.primaryBtn, { backgroundColor: selectedService.color }]}
                      onPress={() => openFormWithService(selectedService)}
                    >
                      <Text style={s.primaryBtnText}>Commander ce service</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.secondaryBtn} onPress={() => openFormWithService(selectedService)}>
                      <Text style={s.secondaryBtnText}>Demander un devis</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Form Modal */}
        <Modal visible={showForm} animationType="slide" transparent>
          <View style={s.overlay}>
            <View style={[s.modal, { maxHeight: '94%' }]}>
              <View style={s.modalHandle} />
              <View style={s.modalHead}>
                <TouchableOpacity style={s.backRow} onPress={formStep > 1 ? prevStep : resetForm}>
                  <Icon name="arrow-left" size={14} color={C.textSecondary} />
                  <Text style={s.modalCancel}>{formStep > 1 ? 'Étape précédente' : 'Retour'}</Text>
                </TouchableOpacity>
                <Text style={s.modalTitle}>Demande d'étude</Text>
                <View style={s.stepIndicator}>
                  <Text style={s.stepIndicatorText}>{formStep}/2</Text>
                </View>
              </View>

              {/* Step bar */}
              <View style={s.stepBar}>
                <View style={[s.stepBarFill, { width: formStep === 1 ? '50%' : '100%' }]} />
              </View>

              {!submitted ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {formStep === 1 && (
                    <>
                      <Text style={s.formLabel}>Quel service vous intéresse ?</Text>
                      <View style={s.chipRow}>
                        {SERVICES.map(s => (
                          <TouchableOpacity
                            key={s.id}
                            style={[s.chip, serviceType === s.title && { backgroundColor: s.color, borderColor: s.color }]}
                            onPress={() => { setServiceType(s.title); setErrors(prev => ({ ...prev, serviceType: undefined })); }}
                          >
                            <Text style={[s.chipText, serviceType === s.title && { color: '#FFF' }]}>
                              {s.title}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {errors.serviceType && <Text style={s.errorText}>{errors.serviceType}</Text>}

                      <Text style={s.formLabel}>Vous êtes ?</Text>
                      <View style={s.chipRow}>
                        {CLIENT_TYPES.map(ct => (
                          <TouchableOpacity
                            key={ct}
                            style={[s.chip, clientType === ct && s.chipOn]}
                            onPress={() => { setClientType(ct); setErrors(prev => ({ ...prev, clientType: undefined })); }}
                          >
                            <Text style={[s.chipText, clientType === ct && s.chipTextOn]}>{ct}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {errors.clientType && <Text style={s.errorText}>{errors.clientType}</Text>}

                      <FloatingInput
                        label="Ville concernée *"
                        value={ville}
                        onChangeText={(v) => { setVille(v); setErrors(prev => ({ ...prev, ville: undefined })); }}
                        placeholder="Ex: Cotonou, Porto-Novo"
                        error={errors.ville}
                      />
                    </>
                  )}

                  {formStep === 2 && (
                    <>
                      <Text style={s.formLabel}>Décrivez votre besoin *</Text>
                      <TextInput
                        style={[s.textarea, errors.description && s.textareaError]}
                        placeholder="Objectifs, délais, budget..."
                        placeholderTextColor="rgba(0,0,0,0.2)"
                        multiline
                        value={description}
                        onChangeText={(d) => { setDescription(d); setErrors(prev => ({ ...prev, description: undefined })); }}
                      />
                      {errors.description && <Text style={s.errorText}>{errors.description}</Text>}

                      <FloatingInput label="Budget (FCFA)" value={budget} onChangeText={setBudget} placeholder="Optionnel" keyboardType="numeric" />

                      <Text style={s.formLabel}>Vos coordonnées</Text>
                      <FloatingInput
                        label="Nom & Prénom *"
                        value={nom}
                        onChangeText={setNom}
                        placeholder="Votre nom"
                      />
                      <FloatingInput
                        label="Email *"
                        value={email}
                        onChangeText={(e) => { setEmail(e); setErrors(prev => ({ ...prev, email: undefined })); }}
                        placeholder="votre@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                      />
                      <FloatingInput
                        label="Téléphone *"
                        value={telephone}
                        onChangeText={(t) => { setTelephone(t); setErrors(prev => ({ ...prev, telephone: undefined })); }}
                        placeholder="+229 XX XX XX XX"
                        keyboardType="phone-pad"
                        error={errors.telephone}
                      />
                    </>
                  )}

                  <View style={s.formNav}>
                    {formStep > 1 && (
                      <TouchableOpacity style={s.backBtn} onPress={prevStep}>
                        <View style={s.btnIconRow}><Icon name="arrow-left" size={13} color={C.text} /><Text style={s.backBtnText}>Retour</Text></View>
                      </TouchableOpacity>
                    )}
                    {formStep < 2 ? (
                      <TouchableOpacity style={s.nextBtn} onPress={nextStep}>
                        <View style={s.btnIconRow}><Text style={s.nextBtnText}>Continuer</Text><Icon name="arrow-right" size={13} color={C.white} /></View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={[s.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
                        <Text style={s.submitText}>{submitting ? 'Envoi en cours…' : 'Soumettre la demande'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>
              ) : (
                <View style={s.success}>
                  <View style={s.successGlow} />
                  <View style={s.successIconWrap}>
                    <Icon name="check" size={26} color={C.white} />
                  </View>
                  <Text style={s.successTitle}>Demande envoyée !</Text>
                  <Text style={s.successDesc}>
                    Votre demande a été transmise avec succès.{'\n'}
                    Notre équipe vous recontactera sous 48h.
                  </Text>
                  <View style={s.successMeta}>
                    <Text style={s.successMetaText}>Confirmation envoyée à {email}</Text>
                  </View>
                  <TouchableOpacity style={s.submitBtn} onPress={resetForm}>
                    <Text style={s.submitText}>Fermer</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  container: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.success },
  heroBadgeDiv: { width: 1, height: 12, backgroundColor: 'rgba(0,0,0,0.08)' },
  heroBadgeText: { fontSize: 12, color: C.textSecondary, fontWeight: '600', letterSpacing: 0.5 },
  heroTitle: { fontSize: 38, fontWeight: '800', color: C.text, lineHeight: 46, letterSpacing: -1, marginBottom: 14 },
  heroDesc: { fontSize: 15, color: C.textSecondary, lineHeight: 24, marginBottom: 28 },
  heroBtn: {
    backgroundColor: C.primaryDark, paddingVertical: 18, paddingHorizontal: 28,
    borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 4,
  },
  heroBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  heroBtnArrow: { color: '#FFF', fontSize: 20, fontWeight: '300', marginTop: -1 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  heroMetaText: { fontSize: 13, color: C.muted, fontWeight: '500' },
  heroMetaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.muted },
  section: { paddingHorizontal: 20, paddingTop: 28 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: C.text, letterSpacing: 1 },
  sectionAction: { fontSize: 13, color: C.primaryDark, fontWeight: '500' },
  sectionActionRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  btnIconRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  ctaBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  statCard: {
    backgroundColor: C.surface,
    borderRadius: 16, padding: 18, width: (width - 50) / 2,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.text, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statNum: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 4 },
  statLabel: { fontSize: 13, color: C.textSecondary, fontWeight: '500' },
  processRow: { marginTop: 14 },
  ctaCard: {
    backgroundColor: C.secondaryDark, borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 6,
    overflow: 'hidden',
  },
  ctaGlow: { fontSize: 60, position: 'absolute', top: -10, right: -10, color: 'rgba(255,255,255,0.03)' },
  ctaTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', lineHeight: 32, marginBottom: 8, letterSpacing: -0.3 },
  ctaDesc: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 20 },
  ctaBtn: { backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: C.text },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  tag: {
    backgroundColor: C.surface,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
  },
  tagText: { fontSize: 13, color: C.textSecondary, fontWeight: '600' },
  trustRow: { marginTop: 14 },
  trustBadge: {
    backgroundColor: C.surface,
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 14, marginRight: 10,
    borderWidth: 1, borderColor: C.border,
  },
  trustBadgeText: { fontSize: 13, color: C.text, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: C.background,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, maxHeight: '85%', paddingBottom: 40,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center', marginBottom: 16 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalCancel: { fontSize: 15, color: C.textSecondary, fontWeight: '500' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  stepIndicator: {
    backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  stepIndicatorText: { fontSize: 12, color: C.textSecondary, fontWeight: '600' },
  stepBar: { height: 3, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 2, marginBottom: 16 },
  stepBarFill: { height: '100%', backgroundColor: C.primary, borderRadius: 2 },
  detailIconWrap: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  detailIcon: { fontSize: 28 },
  detailPriceRow: { marginBottom: 12 },
  detailPrice: { fontSize: 16, fontWeight: '800' },
  detailTitle: { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 14, letterSpacing: -0.3 },
  detailDesc: { fontSize: 15, color: C.textSecondary, lineHeight: 24, marginBottom: 20 },
  detailDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 20 },
  detailSub: { fontSize: 12, fontWeight: '700', color: C.text, letterSpacing: 1, marginBottom: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureDot: { width: 8, height: 8, borderRadius: 4, marginRight: 14 },
  featureText: { fontSize: 15, color: C.text, flex: 1 },
  detailActions: { gap: 10, marginTop: 28 },
  primaryBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { backgroundColor: C.surface, borderRadius: 16, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  secondaryBtnText: { color: C.text, fontSize: 16, fontWeight: '600' },
  formLabel: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 10, marginTop: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
  },
  chipOn: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 13, color: C.textSecondary, fontWeight: '600' },
  chipTextOn: { color: '#FFF' },
  textarea: {
    backgroundColor: C.surface,
    borderRadius: 14, padding: 16,
    fontSize: 15, color: C.text, minHeight: 110,
    textAlignVertical: 'top', marginBottom: 12, lineHeight: 22,
    borderWidth: 1, borderColor: C.border,
  },
  textareaError: { borderColor: C.error },
  errorText: { fontSize: 12, color: C.error, fontWeight: '500', marginBottom: 8, marginTop: -4 },
  formNav: { flexDirection: 'row', gap: 12, marginTop: 12, marginBottom: 20 },
  backBtn: {
    flex: 1, backgroundColor: C.surface, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  backBtnText: { color: C.text, fontSize: 16, fontWeight: '600' },
  nextBtn: {
    flex: 1, backgroundColor: C.primaryDark, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: C.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  submitBtn: {
    flex: 1, backgroundColor: C.success, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: C.success, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  submitText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  success: { alignItems: 'center', paddingVertical: 48 },
  successGlow: {
    position: 'absolute', top: 40, width: 120, height: 120,
    borderRadius: 60, backgroundColor: 'rgba(110,139,91,0.08)',
  },
  successIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.success, justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
    shadowColor: C.success, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  successIcon: { fontSize: 36, color: '#FFF', fontWeight: '700' },
  successTitle: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 10 },
  successDesc: { fontSize: 15, color: C.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 16 },
  successMeta: {
    backgroundColor: 'rgba(193,154,107,0.12)', borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10, marginBottom: 24,
  },
  successMetaText: { fontSize: 13, color: C.primaryDark, fontWeight: '500' },
});
