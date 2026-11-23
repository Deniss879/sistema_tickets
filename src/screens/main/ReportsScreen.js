import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { AppHeader, StatusBadge, PriorityBadge } from '../../components/common';
import { API_URL } from '../../config/api';

export default function ReportsScreen({ navigation }) {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarReporte = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reportes/general`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setReporte(data.data);
      }
    } catch (e) {
      console.log('Error reporte:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarReporte();
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'abierto':     return '#3266CC';
      case 'en_proceso':  return '#B7791F';
      case 'finalizado':  return '#2D6A4F';
      case 'cerrado':     return '#6B7280';
      default:            return COLORS.textSecondary;
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'abierto':     return 'Nuevo';
      case 'en_proceso':  return 'En Proceso';
      case 'finalizado':  return 'Resuelto';
      case 'cerrado':     return 'Cerrado';
      default:            return estado;
    }
  };

  const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return 'Reciente';
    if (typeof fechaRaw === 'string' && fechaRaw.includes('/') && !fechaRaw.includes('-')) return fechaRaw;
    try {
      const isoStr = typeof fechaRaw === 'string' ? fechaRaw.replace(' ', 'T') : fechaRaw;
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return String(fechaRaw);
      return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return String(fechaRaw);
    }
  };

  const renderTicketCard = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => navigation.navigate('TicketDetail', { id: item.id, ticketData: item })}
      activeOpacity={0.85}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketId}>#{item.id}</Text>
        <View style={styles.badgeRow}>
          <PriorityBadge priority={item.prioridad} />
          <View style={{ width: 6 }} />
          <StatusBadge status={item.estado} small />
        </View>
      </View>

      <Text style={styles.ticketArea}>🏢 {item.area_nombre || 'Sin área'}</Text>
      {item.categoria_nombre ? (
        <Text style={styles.ticketCategoria}>🔧 {item.categoria_nombre}</Text>
      ) : null}
      <Text style={styles.ticketDesc} numberOfLines={2}>{item.descripcion}</Text>

      <View style={styles.ticketFooter}>
        <Text style={styles.ticketDate}>
          📅 {formatearFecha(item.created_at || item.fecha_creacion)}
        </Text>
        {item.usuario_nombre ? (
          <Text style={styles.ticketUsuario}>👤 {item.usuario_nombre}</Text>
        ) : null}
        <Text style={styles.ticketVerMas}>Ver detalle ➔</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Reportes e Informes"
        onMenuPress={() => navigation.openDrawer ? navigation.openDrawer() : navigation.goBack()}
        onNotificationPress={() => navigation.navigate('Settings')}
        onHomePress={() => navigation.navigate('Dashboard')}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <Text style={styles.subtitle}>
          Informes ejecutivos de solicitudes técnicas atendidas para Presidencia Municipal.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : reporte ? (
          <>
            {/* Tarjetas resumen numérico */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: '#EBF4FF' }]}>
                <Text style={styles.statNum}>{reporte.resumen?.total_tickets || 0}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#E6FFFA' }]}>
                <Text style={[styles.statNum, { color: COLORS.success }]}>
                  {reporte.resumen?.finalizados || 0}
                </Text>
                <Text style={styles.statLabel}>Resueltos</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#FEFCBF' }]}>
                <Text style={[styles.statNum, { color: '#B7791F' }]}>
                  {reporte.resumen?.en_proceso || 0}
                </Text>
                <Text style={styles.statLabel}>En Proceso</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#EBF4FF' }]}>
                <Text style={[styles.statNum, { color: '#3266CC' }]}>
                  {reporte.resumen?.abiertos || 0}
                </Text>
                <Text style={styles.statLabel}>Nuevos</Text>
              </View>
            </View>

            {/* Desglose por Área */}
            {reporte.por_area && reporte.por_area.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Solicitudes por Área Municipal</Text>
                <View style={styles.card}>
                  {reporte.por_area.map((a, i) => (
                    <View key={i} style={styles.rowItem}>
                      <Text style={styles.itemName}>{a.area || 'Sin área'}</Text>
                      <View style={styles.countsContainer}>
                        <Text style={styles.badgeResueltos}>{a.resueltos} resueltos</Text>
                        <Text style={styles.badgeTotal}>{a.total} total</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Fallas más comunes */}
            {reporte.por_categoria && reporte.por_categoria.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Fallas Más Comunes</Text>
                <View style={styles.card}>
                  {reporte.por_categoria.map((c, i) => (
                    <View key={i} style={styles.rowItem}>
                      <Text style={styles.itemName}>{c.categoria}</Text>
                      <Text style={styles.catCount}>{c.total} reportes</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Lista de tickets recientes con detalle */}
            <Text style={styles.sectionTitle}>
              📋 Tickets Recientes ({reporte.tickets_recientes?.length || 0})
            </Text>
            {reporte.tickets_recientes && reporte.tickets_recientes.length > 0 ? (
              <FlatList
                data={reporte.tickets_recientes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTicketCard}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 4 }}
              />
            ) : (
              <View style={styles.card}>
                <Text style={{ color: COLORS.textSecondary, textAlign: 'center' }}>
                  No hay tickets registrados aún
                </Text>
              </View>
            )}

            {/* Botón Exportar */}
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={() =>
                Alert.alert('Exportar Informe', 'Reporte listo para ser impreso o enviado por WhatsApp a Presidencia')
              }
            >
              <Text style={styles.exportBtnText}>📄 Generar Reporte Oficial</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textSecondary }}>
            No se pudo cargar el reporte
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SIZES.md, paddingBottom: 40 },
  subtitle: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginBottom: SIZES.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.md },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: SIZES.radiusMd,
    marginHorizontal: 2,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statNum: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: 9, color: COLORS.textSecondary, marginTop: 3, textAlign: 'center' },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  itemName: { fontSize: SIZES.caption, fontWeight: '600', color: COLORS.textDark, flex: 1 },
  countsContainer: { flexDirection: 'row', alignItems: 'center' },
  badgeResueltos: {
    backgroundColor: '#E6FFFA',
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeTotal: {
    backgroundColor: COLORS.inputBg,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catCount: { fontSize: SIZES.caption, color: COLORS.primary, fontWeight: '700' },

  // Ticket cards
  ticketCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#3266CC',
    ...SHADOWS.small,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketId: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  ticketArea: { fontSize: SIZES.small, color: '#3266CC', fontWeight: '600', marginBottom: 2 },
  ticketCategoria: { fontSize: SIZES.small, color: COLORS.textSecondary, marginBottom: 4 },
  ticketDesc: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  ticketDate: { fontSize: 11, color: '#8898AA' },
  ticketUsuario: { fontSize: 11, color: '#8898AA' },
  ticketVerMas: { fontSize: SIZES.small, color: '#3266CC', fontWeight: '700' },

  exportBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: SIZES.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    ...SHADOWS.medium,
  },
  exportBtnText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.body },
});
