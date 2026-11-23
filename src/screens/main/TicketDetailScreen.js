import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { AppHeader, StatusBadge, PriorityBadge } from '../../components/common';

import { API_URL } from '../../config/api';

export default function TicketDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);

  // Modal para cambiar estado (admin)
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('en_proceso');
  const [subestado, setSubestado] = useState('');
  const [nota, setNota] = useState('');
  const [updating, setUpdating] = useState(false);

  const cargarTicket = async () => {
    try {
      const userStr = await AsyncStorage.getItem('usuario');
      if (userStr) setUsuario(JSON.parse(userStr));

      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tickets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setTicket(data.data);
      } else {
        Alert.alert('Error', data.message || 'No se pudo cargar el ticket');
      }
    } catch (error) {
      console.log('Error al cargar detalle ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTicket();
  }, [id]);

  const handleCambiarEstado = async () => {
    setUpdating(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tickets/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: nuevoEstado,
          subestado: subestado.trim() || null,
          nota: nota.trim() || null,
        }),
      });
      const data = await response.json();
      if (data.status === 'ok') {
        Alert.alert('Éxito', data.message);
        setModalVisible(false);
        setSubestado('');
        setNota('');
        cargarTicket();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  const handleReabrir = async () => {
    Alert.alert(
      'Reabrir Ticket',
      '¿Deseas reabrir este ticket finalizado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reabrir',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const res = await fetch(`${API_URL}/api/tickets/${id}/reabrir`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nota: 'Reabierto por administrador' }),
              });
              const json = await res.json();
              if (json.status === 'ok') {
                Alert.alert('Éxito', 'Ticket reabierto');
                cargarTicket();
              }
            } catch (e) {
              Alert.alert('Error', 'No se pudo reabrir');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title="Detalle del Ticket" onMenuPress={() => navigation.goBack()} />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title="Detalle del Ticket" onMenuPress={() => navigation.goBack()} />
        <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textSecondary }}>Ticket no encontrado</Text>
      </SafeAreaView>
    );
  }

  // Línea de vida de los 3 estados principales
  const estadosPaso = [
    { label: 'Nuevo / Abierto', key: 'abierto', alcanzado: true },
    { label: 'En Proceso', key: 'en_proceso', alcanzado: ticket.estado === 'en_proceso' || ticket.estado === 'finalizado' },
    { label: 'Finalizado', key: 'finalizado', alcanzado: ticket.estado === 'finalizado' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title={`Seguimiento Ticket #${ticket.id}`}
        onMenuPress={() => navigation.goBack()}
        onNotificationPress={() => navigation.navigate('Settings')}
        onHomePress={() => navigation.navigate('Dashboard')}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Encabezado del Ticket */}
        <View style={styles.mainCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.ticketId}>Ticket #{ticket.id}</Text>
            <View style={{ flexDirection: 'row' }}>
              <PriorityBadge priority={ticket.prioridad} />
              <View style={{ width: 6 }} />
              <StatusBadge status={ticket.estado} />
            </View>
          </View>

          <Text style={styles.label}>Área Solicitante:</Text>
          <Text style={styles.valueText}>{ticket.area_nombre} {ticket.area_encargado ? `(${ticket.area_encargado})` : ''}</Text>

          <Text style={styles.label}>Solicitante:</Text>
          <Text style={styles.valueText}>{ticket.usuario_nombre}</Text>

          {ticket.categoria_nombre && (
            <>
              <Text style={styles.label}>Categoría:</Text>
              <Text style={styles.valueText}>{ticket.categoria_nombre}</Text>
            </>
          )}

          <Text style={styles.label}>Tipo de Intervención:</Text>
          <Text style={styles.valueText}>
            {ticket.tipo_intervencion === 'in_situ' ? '🏃 In Situ (en oficina)' : '📦 Traslado a Centro de Sistemas'}
          </Text>

          <Text style={styles.label}>Descripción de la falla:</Text>
          <View style={styles.descBox}>
            <Text style={styles.descText}>{ticket.descripcion}</Text>
          </View>

          {ticket.subestado && (
            <View style={styles.subestadoBox}>
              <Text style={styles.subestadoTitle}>📌 Estado del trabajo actual:</Text>
              <Text style={styles.subestadoText}>{ticket.subestado}</Text>
            </View>
          )}
        </View>

        {/* Diagrama de Seguimiento Visual (Stepper) */}
        <Text style={styles.sectionTitle}>Progreso del Soporte</Text>
        <View style={styles.stepperCard}>
          {estadosPaso.map((paso, idx) => (
            <View key={paso.key} style={styles.stepRow}>
              <View style={styles.indicatorCol}>
                <View style={[styles.stepCircle, paso.alcanzado && styles.stepCircleActive]}>
                  <Text style={[styles.stepCircleText, paso.alcanzado && styles.stepCircleTextActive]}>
                    {paso.alcanzado ? '✓' : idx + 1}
                  </Text>
                </View>
                {idx < estadosPaso.length - 1 && (
                  <View style={[styles.stepLine, paso.alcanzado && styles.stepLineActive]} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepLabel, paso.alcanzado && styles.stepLabelActive]}>
                  {paso.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Explicación amigable del estado actual */}
        <View style={[
          styles.statusExplainCard,
          ticket.estado === 'abierto' && { borderLeftColor: COLORS.info, backgroundColor: '#F0F9FF' },
          ticket.estado === 'en_proceso' && { borderLeftColor: COLORS.warning, backgroundColor: '#FFFDF0' },
          ticket.estado === 'finalizado' && { borderLeftColor: COLORS.success, backgroundColor: '#F2FFF5' },
        ]}>
          <Text style={styles.statusExplainTitle}>
            {ticket.estado === 'abierto' && '📬 Reporte Registrado y en Cola'}
            {ticket.estado === 'en_proceso' && '⏳ En Atención por Soporte Técnico'}
            {ticket.estado === 'finalizado' && '✅ Falla Resuelta y Concluida'}
          </Text>
          <Text style={styles.statusExplainDesc}>
            {ticket.estado === 'abierto' && 'Tu reporte ha sido recibido por el departamento de sistemas y está en espera de ser atendido por un técnico.'}
            {ticket.estado === 'en_proceso' && (ticket.subestado ? `Detalle operativo: ${ticket.subestado}` : 'Un técnico se encuentra revisando y dando solución a tu falla.')}
            {ticket.estado === 'finalizado' && 'El servicio técnico ha concluido satisfactoriamente. Si requieres más ayuda o la falla persiste, puedes reportarlo de nuevo.'}
          </Text>
        </View>

        {/* Fotos de evidencia */}
        {ticket.fotos && ticket.fotos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Evidencias Fotográficas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
              {ticket.fotos.map((f, i) => (
                <Image
                  key={i}
                  source={{ uri: `${API_URL}${f.ruta_foto}` }}
                  style={styles.photoThumb}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Historial de Notas y Cambios */}
        <Text style={styles.sectionTitle}>Historial de Atención</Text>
        <View style={styles.historyCard}>
          {ticket.historial && ticket.historial.length > 0 ? (
            ticket.historial.map((h, i) => (
              <View key={i} style={styles.historyItem}>
                <View style={styles.historyMeta}>
                  <Text style={styles.historyUser}>👤 {h.usuario_nombre || 'Sistema'}</Text>
                  <Text style={styles.historyTime}>
                    {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {h.estado_nuevo && (
                  <Text style={styles.historyChange}>
                    Cambió de <Text style={{ fontWeight: '700' }}>{h.estado_anterior || 'Inicio'}</Text> a <Text style={{ fontWeight: '700' }}>{h.estado_nuevo}</Text>
                  </Text>
                )}
                {h.nota && <Text style={styles.historyNote}>{h.nota}</Text>}
              </View>
            ))
          ) : (
            <Text style={{ color: COLORS.textSecondary, fontStyle: 'italic' }}>Sin cambios registrados</Text>
          )}
        </View>

        {/* Acciones para Administrador / Técnico */}
        {usuario?.rol === 'admin' && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.btnActionPrimary}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.btnActionText}>⚙️ Cambiar Estado / Agregar Nota</Text>
            </TouchableOpacity>

            {ticket.estado === 'finalizado' && (
              <TouchableOpacity
                style={[styles.btnActionPrimary, { backgroundColor: COLORS.warning, marginTop: 10 }]}
                onPress={handleReabrir}
              >
                <Text style={styles.btnActionText}>🔄 Reabrir Ticket</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal Cambiar Estado */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Actualizar Estado del Ticket</Text>

            <Text style={styles.modalLabel}>Selecciona el nuevo estado:</Text>
            <View style={styles.modalStatesRow}>
              {['abierto', 'en_proceso', 'finalizado'].map(st => (
                <TouchableOpacity
                  key={st}
                  style={[styles.stateBtn, nuevoEstado === st && styles.stateBtnActive]}
                  onPress={() => setNuevoEstado(st)}
                >
                  <Text style={[styles.stateBtnText, nuevoEstado === st && styles.stateBtnTextActive]}>
                    {st === 'abierto' ? 'Abierto' : st === 'en_proceso' ? 'En Proceso' : 'Finalizado'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Subestado / Detalle operativo:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej. En espera de refacción, pasta térmica..."
              placeholderTextColor={COLORS.textSecondary}
              value={subestado}
              onChangeText={setSubestado}
            />

            <Text style={styles.modalLabel}>Nota de seguimiento:</Text>
            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Escribe la explicación o instrucciones..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              value={nota}
              onChangeText={setNota}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#E2E8F0' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: COLORS.textDark, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                onPress={handleCambiarEstado}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={{ color: COLORS.white, fontWeight: '700' }}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SIZES.md, paddingBottom: 40 },
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ticketId: { fontSize: SIZES.h3, fontWeight: '700', color: COLORS.textPrimary },
  label: { fontSize: SIZES.small, color: COLORS.textSecondary, marginTop: 8, fontWeight: '600' },
  valueText: { fontSize: SIZES.body, color: COLORS.textDark, marginTop: 2 },
  descBox: { backgroundColor: COLORS.surface, padding: 12, borderRadius: SIZES.radiusSm, marginTop: 4 },
  descText: { fontSize: SIZES.body, color: COLORS.textDark, lineHeight: 20 },
  subestadoBox: {
    backgroundColor: '#FFFBEA',
    borderColor: '#FFE082',
    borderWidth: 1,
    padding: 10,
    borderRadius: SIZES.radiusSm,
    marginTop: 12,
  },
  subestadoTitle: { fontSize: SIZES.caption, color: '#B7791F', fontWeight: '700' },
  subestadoText: { fontSize: SIZES.body, color: '#744210', marginTop: 2 },
  sectionTitle: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.textPrimary, marginVertical: 10 },
  stepperCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    ...SHADOWS.small,
  },
  statusExplainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    borderLeftWidth: 4,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  statusExplainTitle: {
    fontSize: SIZES.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statusExplainDesc: {
    fontSize: SIZES.small,
    color: COLORS.textDark,
    lineHeight: 18,
  },
  stepRow: { flexDirection: 'row', minHeight: 46 },
  indicatorCol: { alignItems: 'center', width: 30 },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: COLORS.primary },
  stepCircleText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '700' },
  stepCircleTextActive: { color: COLORS.white },
  stepLine: { width: 3, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 2 },
  stepLineActive: { backgroundColor: COLORS.primary },
  stepContent: { flex: 1, paddingLeft: 12, justifyContent: 'flex-start', paddingTop: 3 },
  stepLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  stepLabelActive: { color: COLORS.textPrimary, fontWeight: '700' },
  photosScroll: { marginBottom: SIZES.md },
  photoThumb: { width: 120, height: 120, borderRadius: SIZES.radiusSm, marginRight: 10, backgroundColor: '#E2E8F0' },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  historyItem: { borderBottomWidth: 1, borderBottomColor: '#EEF2F8', paddingVertical: 10 },
  historyMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  historyUser: { fontSize: SIZES.caption, fontWeight: '700', color: COLORS.textPrimary },
  historyTime: { fontSize: SIZES.small, color: COLORS.textSecondary },
  historyChange: { fontSize: SIZES.caption, color: COLORS.textDark, marginBottom: 2 },
  historyNote: { fontSize: SIZES.body, color: COLORS.textDark, fontStyle: 'italic', marginTop: 2 },
  adminActions: { marginTop: 10 },
  btnActionPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radiusFull,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  btnActionText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.body },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SIZES.lg,
  },
  modalTitle: { fontSize: SIZES.h3, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  modalLabel: { fontSize: SIZES.caption, fontWeight: '600', color: COLORS.textDark, marginTop: 10, marginBottom: 6 },
  modalStatesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  stateBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  stateBtnActive: { backgroundColor: COLORS.primary },
  stateBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: SIZES.caption },
  stateBtnTextActive: { color: COLORS.white },
  modalInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: SIZES.body,
    color: COLORS.textDark,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: SIZES.radiusFull, alignItems: 'center', marginHorizontal: 6 },
});
