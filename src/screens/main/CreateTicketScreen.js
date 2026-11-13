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

export default function CreateTicketScreen({ navigation }) {
  const [areas, setAreas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [equipos, setEquipos] = useState([]);

  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [tipoIntervencion, setTipoIntervencion] = useState('in_situ');
  const [descripcion, setDescripcion] = useState('');

  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Modales de selección
  const [modalAreaVisible, setModalAreaVisible] = useState(false);
  const [modalCatVisible, setModalCatVisible] = useState(false);

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resAreas, resCats] = await Promise.all([
        fetch(`${API_URL}/api/areas`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/api/categorias`, { headers }).then(r => r.json())
      ]);

      if (resAreas.status === 'ok') setAreas(resAreas.data || []);
      if (resCats.status === 'ok') setCategorias(resCats.data || []);

      // Intentar auto-seleccionar el área del usuario logueado
      const userStr = await AsyncStorage.getItem('usuario');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.area_id && resAreas.data) {
          const areaUser = resAreas.data.find(a => a.id === u.area_id);
          if (areaUser) setSelectedArea(areaUser);
        }
      }
    } catch (e) {
      console.log('Error catalogos:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTicket = async () => {
    if (!selectedArea) {
      Alert.alert('Falta información', 'Por favor selecciona el área que solicita.');
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert('Falta información', 'Por favor detalla la falla de forma clara.');
      return;
    }

    setEnviando(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const body = {
        area_id: selectedArea.id,
        categoria_id: selectedCategoria ? selectedCategoria.id : null,
        equipo_id: selectedEquipo ? selectedEquipo.id : null,
        descripcion: descripcion.trim(),
        tipo_intervencion: tipoIntervencion,
      };

      const response = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.status === 'ok') {
        Alert.alert(
          '¡Ticket Levantado!',
          `Tu ticket #${data.ticket.id} fue creado con prioridad: ${data.ticket.prioridad.toUpperCase()}.`,
          [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Aviso', data.message || 'No se pudo crear el ticket');
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Levantar Ticket"
        onMenuPress={() => navigation.goBack()}
        onNotificationPress={() => navigation.navigate('Settings')}
        onHomePress={() => navigation.navigate('Dashboard')}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerSubtitle}>
          Reporta fallas técnicas de cómputo, red, sistemas o consumibles.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 30 }} />
        ) : (
          <View style={styles.formCard}>
            {/* Campo Área */}
            <Text style={styles.fieldLabel}>Área / Departamento *</Text>
            <TouchableOpacity
              style={styles.pickerSelector}
              onPress={() => setModalAreaVisible(true)}
            >
              <Text style={[styles.pickerText, !selectedArea && { color: COLORS.textSecondary }]}>
                {selectedArea ? `${selectedArea.nombre} ${selectedArea.es_prioritaria ? '🔴 [PRIORITARIA]' : ''}` : 'Selecciona tu área...'}
              </Text>
              <Text style={{ color: COLORS.primary }}>▼</Text>
            </TouchableOpacity>

            {/* Campo Categoría */}
            <Text style={styles.fieldLabel}>Tipo de Falla / Categoría</Text>
            <TouchableOpacity
              style={styles.pickerSelector}
              onPress={() => setModalCatVisible(true)}
            >
              <Text style={[styles.pickerText, !selectedCategoria && { color: COLORS.textSecondary }]}>
                {selectedCategoria ? selectedCategoria.nombre : 'Selecciona una categoría...'}
              </Text>
              <Text style={{ color: COLORS.primary }}>▼</Text>
            </TouchableOpacity>

            {/* Tipo de Intervención */}
            <Text style={styles.fieldLabel}>Tipo de Atención Requerida</Text>
            <View style={styles.intervencionRow}>
              <TouchableOpacity
                style={[styles.intervencionBtn, tipoIntervencion === 'in_situ' && styles.intervencionBtnActive]}
                onPress={() => setTipoIntervencion('in_situ')}
              >
                <Text style={[styles.intervencionText, tipoIntervencion === 'in_situ' && styles.intervencionTextActive]}>
                  🏃 In Situ (en tu oficina)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.intervencionBtn, tipoIntervencion === 'traslado_centro' && styles.intervencionBtnActive]}
                onPress={() => setTipoIntervencion('traslado_centro')}
              >
                <Text style={[styles.intervencionText, tipoIntervencion === 'traslado_centro' && styles.intervencionTextActive]}>
                  📦 Traslado a Sistemas
                </Text>
              </TouchableOpacity>
            </View>

            {/* Descripción Detallada */}
            <Text style={styles.fieldLabel}>Descripción Detallada de la Falla *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Ej. La impresora Canon no jala el papel, marca error E03 y parpadea el foco naranja..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              value={descripcion}
              onChangeText={setDescripcion}
            />

            {/* Placeholder de Fotos de Evidencia */}
            <Text style={styles.fieldLabel}>Evidencias Fotográficas (1 a 3 fotos)</Text>
            <TouchableOpacity
              style={styles.photoPickerBtn}
              onPress={() => Alert.alert('Cámara / Galería', 'Función de adjuntar fotos disponible en dispositivo')}
            >
              <Text style={{ fontSize: 24 }}>📷</Text>
              <Text style={{ color: COLORS.primary, fontWeight: '600', marginTop: 4 }}>
                Tomar foto o elegir de galería
              </Text>
            </TouchableOpacity>

            {/* Botón de Enviar */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleCrearTicket}
              disabled={enviando}
            >
              {enviando ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitBtnText}>Levantar Ticket</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal Seleccionar Área */}
      <Modal visible={modalAreaVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Área</Text>
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
                <View>
                  <Text style={styles.modalItemText}>{item.nombre}</Text>
                  {item.encargado && <Text style={styles.modalItemSub}>{item.encargado}</Text>}
                </View>
                {item.es_prioritaria === 1 && (
                  <Text style={{ color: COLORS.danger, fontWeight: '700', fontSize: 12 }}>ALTA PRIORIDAD</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Modal Seleccionar Categoría */}
      <Modal visible={modalCatVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Tipo de Falla</Text>
            <TouchableOpacity onPress={() => setModalCatVisible(false)}>
              <Text style={styles.modalClose}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categorias}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedCategoria(item);
                  setModalCatVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.nombre}</Text>
                {item.descripcion && <Text style={styles.modalItemSub}>{item.descripcion}</Text>}
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
  container: { padding: SIZES.md, paddingBottom: 40 },
  headerSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    ...SHADOWS.small,
  },
  fieldLabel: {
    fontSize: SIZES.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  pickerSelector: {
    backgroundColor: COLORS.inputBg,
    height: 50,
    borderRadius: SIZES.radiusSm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  pickerText: { fontSize: SIZES.body, color: COLORS.textDark, flex: 1 },
  intervencionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  intervencionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: COLORS.white,
  },
  intervencionBtnActive: { backgroundColor: COLORS.primary },
  intervencionText: { fontSize: SIZES.caption, color: COLORS.primary, fontWeight: '600' },
  intervencionTextActive: { color: COLORS.white },
  textArea: {
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radiusSm,
    padding: 12,
    fontSize: SIZES.body,
    color: COLORS.textDark,
    textAlignVertical: 'top',
    height: 100,
  },
  photoPickerBtn: {
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1.5,
    borderColor: '#B8CFFC',
    borderStyle: 'dashed',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: SIZES.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    ...SHADOWS.medium,
  },
  submitBtnText: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '700' },
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
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  modalItemText: { fontSize: SIZES.body, fontWeight: '600', color: COLORS.textDark },
  modalItemSub: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: 2 },
});
