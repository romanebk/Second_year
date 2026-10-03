import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEarthAfrica, faLocationDot, faCheck } from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../constants/colors';

const { height } = Dimensions.get('window');

const styles = {
  modalBg: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'CenturyGothic',
  },
  villeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedVilleItem: {
    backgroundColor: COLORS.chipBg,
  },
  villeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
    fontFamily: 'CenturyGothic',
  },
  selectedVilleName: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  villePays: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginLeft: 10,
    fontFamily: 'CenturyGothic',
  },
  checkMark: {
    marginLeft: 'auto',
    fontSize: 18,
    color: COLORS.primary,
  },
  closeBtn: {
    marginTop: 15,
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'CenturyGothic',
  },
};

export default function VilleSelector({ visible, villes, selected, onSelect, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBg}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sélectionner une ville</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.villeItem, selected === 'toutes' && styles.selectedVilleItem]}
              onPress={() => onSelect('toutes')}
            >
              <FontAwesomeIcon icon={faEarthAfrica} color={COLORS.primary} style={{ fontSize: 18 }} />
              <Text style={[styles.villeName, selected === 'toutes' && styles.selectedVilleName]}>
                Toutes les villes
              </Text>
              {selected === 'toutes' && <FontAwesomeIcon icon={faCheck} color={COLORS.primary} style={{ fontSize: 16, marginLeft: 'auto' }} />}
            </TouchableOpacity>
            {villes.map((ville) => (
              <TouchableOpacity
                key={ville.id}
                style={[styles.villeItem, selected === ville.id && styles.selectedVilleItem]}
                onPress={() => onSelect(ville.id)}
              >
                <FontAwesomeIcon icon={faLocationDot} color={COLORS.primary} style={{ fontSize: 18 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.villeName, selected === ville.id && styles.selectedVilleName]}>
                    {ville.nom}
                  </Text>
                  <Text style={styles.villePays}>{ville.pays}</Text>
                </View>
                {selected === ville.id && <FontAwesomeIcon icon={faCheck} color={COLORS.primary} style={{ fontSize: 16, marginLeft: 'auto' }} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
