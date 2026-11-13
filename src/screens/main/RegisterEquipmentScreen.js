import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { AppHeader } from '../../components/common';

import { API_URL } from '../../config/api';

export default function RegisterEquipmentScreen({ navigation }) {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [tipo, setTipo] = useState('computadora');
  const [selectedArea, setSelectedArea] = useState(null);

  const [areas, setAreas] = useState([]);
  const [modalAreaVisible, setModalAreaVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarAreas();
  }, []);

  const cargarAreas = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/areas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'ok') setAreas(data.data || []);
    } catch (e) {
      console.log('Error areas:', e);
    }
  };

  const handleGuardar = async () => {
    if (!marca.trim() || !modelo.trim()) {
      Alert.alert('Falta información', 'Marca y modelo son obligatorios.');
      return;
    }

    setGuardando(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/equipos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marca: marca.trim(),
          modelo: modelo.trim(),
          numero_serie: numeroSerie.trim() || null,
          tipo,
          area_id: selectedArea ? selectedArea.id : null,
        }),
      });

      const data = await response.json();
      if (data.status === 'ok') {
        Alert.alert('Éxito', 'Equipo registrado en la bitácora', [
          { text: 'Aceptar', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.message || 'No se pudo registrar');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Registrar Equipo"
        onMenuPress={() => navigation.goBack()}
        onNotificationPress={() => navigation.navigate('Settings')}
        onHomePress={() => navigation.navigate('Dashboard')}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Datos del Equipo Técnico</Text>

          {/* Tipo de Equipo */}
          <Text style={styles.label}>Tipo de Dispositivo</Text>
          <View style={styles.tipoRow}>
            {[
              { id: 'computadora', label: '💻 PC / Laptop' },
              { id: 'impresora', label: '🖨️ Impresora' },
              { id: 'otro', label: '🔌 Otro' },
            ].map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.tipoBtn, tipo === t.id && styles.tipoBtnActive]}
                onPress={() => setTipo(t.id)}
              >
                <Text style={[styles.tipoBtnText, tipo === t.id && styles.tipoBtnTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Marca *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. HP, Dell, Canon, Epson..."
            placeholderTextColor={COLORS.textSecondary}
            value={marca}
            onChangeText={setMarca}
          />

          <Text style={styles.label}>Modelo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. ProDesk 400 G6, EcoTank L3250..."
            placeholderTextColor={COLORS.textSecondary}
            value={modelo}
            onChangeText={setModelo}
          />

          <Text style={styles.label}>Número de Serie</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. MXL12345ABC"
            placeholderTextColor={COLORS.textSecondary}
            value={numeroSerie}
            onChangeText={setNumeroSerie}
          />

          <Text style={styles.label}>Área donde se ubica</Text>
          <TouchableOpacity
            style={styles.pickerSelector}
            onPress={() => setModalAreaVisible(true)}
          >
            <Text style={[styles.pickerText, !selectedArea && { color: COLORS.textSecondary }]}>
              {selectedArea ? selectedArea.nombre : 'Seleccionar área municipal...'}
            </Text>
            <Text style={{ color: COLORS.primary }}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnGuardar}
            onPress={handleGuardar}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.btnGuardarText}>Guardar en Bitácora</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Seleccionar Área */}
      <Modal visible={modalAreaVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Asignar Área</Text>
            <TouchableOpacity onPress={() => setModalAreaVisible(false)}>
              <Text style={styles.modalClose}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={areas}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedArea(item);
                  setModalAreaVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.nombre}</Text>
                {item.encargado && <Text style={styles.modalItemSub}>{item.encargado}</Text>}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SIZES.md },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    ...SHADOWS.small,
  },
  sectionTitle: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  label: { fontSize: SIZES.caption, fontWeight: '700', color: COLORS.textPrimary, marginTop: 12, marginBottom: 6 },
  tipoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tipoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    marginHorizontal: 3,
    backgroundColor: COLORS.white,
  },
  tipoBtnActive: { backgroundColor: COLORS.primary },
  tipoBtnText: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
  tipoBtnTextActive: { color: COLORS.white },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radiusSm,
    height: 48,
    paddingHorizontal: 12,
    fontSize: SIZES.body,
    color: COLORS.textDark,
  },
  pickerSelector: {
    backgroundColor: COLORS.inputBg,
    height: 48,
    borderRadius: SIZES.radiusSm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  pickerText: { fontSize: SIZES.body, color: COLORS.textDark, flex: 1 },
  btnGuardar: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: SIZES.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    ...SHADOWS.medium,
  },
  btnGuardarText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.body },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
    alignItems: 'center',
  },
  modalTitle: { fontSize: SIZES.h3, fontWeight: '700', color: COLORS.textPrimary },
  modalClose: { fontSize: SIZES.body, color: COLORS.primary, fontWeight: '600' },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  modalItemText: { fontSize: SIZES.body, fontWeight: '600', color: COLORS.textDark },
  modalItemSub: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: 2 },
});
