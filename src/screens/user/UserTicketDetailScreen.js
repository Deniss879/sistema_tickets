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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { AppHeader, StatusBadge, PriorityBadge } from '../../components/common';
import { API_URL } from '../../config/api';

const formatearFecha = (fechaRaw) => {
  if (!fechaRaw) return 'Fecha no registrada';
  if (typeof fechaRaw === 'string' && fechaRaw.includes('/') && !fechaRaw.includes('-')) return fechaRaw;
  try {
    const isoStr = typeof fechaRaw === 'string' ? fechaRaw.replace(' ', 'T') : fechaRaw;
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return String(fechaRaw);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return String(fechaRaw);
  }
};

export default function UserTicketDetailScreen({ route, navigation }) {
  const { id, ticketData } = route.params || {};
  const [ticket, setTicket] = useState(ticketData || null);
  const [loading, setLoading] = useState(!ticketData);

  const cargarTicket = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${API_URL}/api/tickets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (data.status === 'ok' && data.data) {
        setTicket(data.data);
        return;
      }
    } catch (error) {
      console.log('UserTicketDetail fetch error, usando caché local:', error);
    }

    // Fallback: buscar en cached_user_tickets si la red falla
    try {
      const cached = await AsyncStorage.getItem('cached_user_tickets');
      if (cached) {
        const lista = JSON.parse(cached);
        const found = lista.find(
          (t) => String(t.id) === String(id) || String(t.folio) === String(id)
        );
        if (found) {
          setTicket((prev) => prev || found);
          return;
        }
      }
    } catch (e) {}

    // Si aún no se tiene ticket y se pasó ticketData
    if (ticketData) {
      setTicket(ticketData);
    }
  };

  useEffect(() => {
    cargarTicket().finally(() => setLoading(false));
  }, [id]);

  if (loading && !ticket) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          title="Detalle de Mi Reporte"
          onMenuPress={() => navigation.goBack()}
          onHomePress={() => navigation.navigate('UserHome')}
        />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          title="Detalle de Mi Reporte"
          onMenuPress={() => navigation.goBack()}
          onHomePress={() => navigation.navigate('UserHome')}
        />
        <View style={styles.emptyWrap}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
          <Text style={styles.emptyTitle}>Reporte #{id} no encontrado</Text>
          <Text style={styles.emptySub}>
            No pudimos recuperar los datos de este ticket. Intenta actualizar tus reportes.
          </Text>
          <TouchableOpacity
            style={styles.btnVolver}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnVolverText}>Volver a Mis Reportes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const esAltaPrioridad =
    ticket.prioridad === 'alta' ||
    ticket.prioridad === 'urgente' ||
    ticket.es_prioritaria == 1;

  const pasos = [
    { label: 'Reporte Recibido', alcanzado: true },
    {
      label: 'En Atención / Revisión',
      alcanzado: ticket.estado === 'en_proceso' || ticket.estado === 'finalizado',
    },
    { label: 'Falla Resuelta', alcanzado: ticket.estado === 'finalizado' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title={`Mi Reporte #${ticket.id}`}
        onMenuPress={() => navigation.goBack()}
        onHomePress={() => navigation.navigate('UserHome')}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Tarjeta Resumen Principal */}
        <View style={styles.mainCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.ticketId}>Folio #{ticket.id}</Text>
              <Text style={styles.ticketFechaHeader}>
                📅 {formatearFecha(ticket.created_at || ticket.fecha_creacion)}
              </Text>
            </View>
            <StatusBadge status={ticket.estado} />
          </View>

          {/* Badge de Prioridad */}
          <View style={styles.prioridadRow}>
            <Text style={styles.labelPrioridad}>Prioridad:</Text>
            <PriorityBadge priority={ticket.prioridad || (esAltaPrioridad ? 'alta' : 'normal')} />
            {esAltaPrioridad && (
              <View style={styles.badgePrioUrgente}>
                <Text style={styles.badgePrioUrgenteText}>🔥 ATENCIÓN PRIORITARIA</Text>
              </View>
            )}
          </View>

          {/* Área Solicitante */}
          <Text style={styles.label}>Área Solicitante:</Text>
          <View style={styles.infoRowBox}>
            <Text style={styles.valText}>🏢 {ticket.area_nombre || 'Área Municipal'}</Text>
          </View>

          {/* Categoría / Falla */}
          <Text style={styles.label}>Servicio o Falla Reportada:</Text>
          <View style={styles.infoRowBox}>
            <Text style={styles.valText}>
              🔧 {ticket.categoria_nombre || 'Soporte General de Sistemas'}
            </Text>
          </View>

          {/* Modalidad de Atención */}
          <Text style={styles.label}>Modalidad de Atención:</Text>
          <View style={styles.infoRowBox}>
            <Text style={styles.valText}>
              {ticket.tipo_intervencion === 'in_situ'
                ? '🏃 En mi oficina (El técnico asiste a tu departamento)'
                : '📦 En Sistemas (Equipo en Centro de Cómputo)'}
            </Text>
          </View>

          {/* Descripción detallada */}
          <Text style={styles.label}>Descripción de la Falla:</Text>
          <View style={styles.descBox}>
            <Text style={styles.descText}>{ticket.descripcion}</Text>
          </View>
        </View>

        {/* Línea de Avance / Seguimiento */}
        <Text style={styles.sectionTitle}>Avance del Soporte Técnico</Text>
        <View style={styles.stepperCard}>
          {pasos.map((p, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepIndicator}>
                <View style={[styles.stepCircle, p.alcanzado && styles.stepCircleActive]}>
                  <Text style={[styles.stepNum, p.alcanzado && styles.stepNumActive]}>
                    {p.alcanzado ? '✓' : idx + 1}
                  </Text>
                </View>
                {idx < pasos.length - 1 && (
                  <View style={[styles.stepLine, p.alcanzado && styles.stepLineActive]} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepText, p.alcanzado && styles.stepTextActive]}>
                  {p.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tarjeta explicativa de estado */}
        <View
          style={[
            styles.explainCard,
            ticket.estado === 'abierto' && { borderLeftColor: COLORS.info, backgroundColor: '#F0F9FF' },
            ticket.estado === 'en_proceso' && { borderLeftColor: COLORS.warning, backgroundColor: '#FFFDF0' },
            ticket.estado === 'finalizado' && { borderLeftColor: COLORS.success, backgroundColor: '#F2FFF5' },
          ]}
        >
          <Text style={styles.explainTitle}>
            {ticket.estado === 'abierto' && '📬 Reporte en Espera de Asignación'}
            {ticket.estado === 'en_proceso' && '⏳ Un Técnico Está Atendiendo tu Problema'}
            {ticket.estado === 'finalizado' && '✅ Problema Resuelto y Concluido'}
          </Text>
          <Text style={styles.explainDesc}>
            {ticket.estado === 'abierto' &&
              'Tu reporte ha sido registrado en el sistema y se encuentra en cola para ser atendido por el personal de Sistemas de Presidencia.'}
            {ticket.estado === 'en_proceso' &&
              (ticket.subestado
                ? `Estado del trabajo: ${ticket.subestado}`
                : 'El personal técnico se encuentra revisando o realizando la reparación.')}
            {ticket.estado === 'finalizado' &&
              'El servicio técnico ha concluido satisfactoriamente. Si requieres más apoyo, puedes levantar otro ticket.'}
          </Text>
        </View>

        {/* Notas del Técnico (Historial) */}
        {ticket.historial && ticket.historial.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Notas y Avances de Sistemas</Text>
            <View style={styles.historyCard}>
              {ticket.historial.map((h, i) => (
                <View key={i} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyAuthor}>👤 {h.usuario_nombre || 'Técnico de Sistemas'}</Text>
                    <Text style={styles.historyDate}>
                      {formatearFecha(h.created_at)}
                    </Text>
                  </View>
                  {h.nota && <Text style={styles.historyNote}>{h.nota}</Text>}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    padding: SIZES.md,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  ticketFechaHeader: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  prioridadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F4FF',
  },
  labelPrioridad: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  badgePrioUrgente: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  badgePrioUrgenteText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  label: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 2,
  },
  infoRowBox: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  valText: {
    fontSize: SIZES.body,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  descBox: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: SIZES.radiusSm,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2EAF8',
  },
  descText: {
    fontSize: SIZES.body,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
    marginTop: SIZES.xs,
  },
  stepperCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    ...SHADOWS.small,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 46,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 28,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepNum: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  stepNumActive: {
    color: COLORS.white,
  },
  stepLine: {
    width: 2.5,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 2,
  },
  stepText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  stepTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  explainCard: {
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    borderLeftWidth: 4,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  explainTitle: {
    fontSize: SIZES.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  explainDesc: {
    fontSize: SIZES.small,
    color: COLORS.textDark,
    lineHeight: 18,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    ...SHADOWS.small,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
    paddingVertical: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyAuthor: {
    fontSize: SIZES.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
  historyDate: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  historyNote: {
    fontSize: SIZES.body,
    color: COLORS.textDark,
    marginTop: 2,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  btnVolver: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: SIZES.radiusFull,
  },
  btnVolverText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: SIZES.body,
  },
});
