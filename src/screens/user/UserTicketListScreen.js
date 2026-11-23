import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { AppHeader, StatusBadge, PriorityBadge } from '../../components/common';
import { API_URL } from '../../config/api';
import UserDrawerMenu from './UserDrawerMenu';

const formatearFecha = (fechaRaw) => {
  if (!fechaRaw) return 'Reciente';
  if (typeof fechaRaw === 'string' && fechaRaw.includes('/') && !fechaRaw.includes('-')) return fechaRaw;
  try {
    const isoStr = typeof fechaRaw === 'string' ? fechaRaw.replace(' ', 'T') : fechaRaw;
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return String(fechaRaw);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    return String(fechaRaw);
  }
};

const parseEstadoInicial = (param) => {
  if (!param || param === 'todos') return 'todos';
  if (param === 'abierto' || param === 'en_proceso' || param === 'pendientes') return 'pendientes';
  if (param === 'finalizado' || param === 'resueltos') return 'resueltos';
  return 'todos';
};

export default function UserTicketListScreen({ route, navigation }) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState(parseEstadoInicial(route?.params?.estado));
  const [busqueda, setBusqueda] = useState('');
  const [usuario, setUsuario] = useState(null);

  const cargarTickets = async () => {
    try {
      const userStr = await AsyncStorage.getItem('usuario');
      if (userStr) setUsuario(JSON.parse(userStr));

      const token = await AsyncStorage.getItem('token');
      const url = `${API_URL}/api/tickets`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (data.status === 'ok' && Array.isArray(data.data)) {
        setTickets(data.data);
        await AsyncStorage.setItem('cached_user_tickets', JSON.stringify(data.data));
      }
    } catch (error) {
      console.log('Modo local en UserTicketListScreen:', error);
      const cached = await AsyncStorage.getItem('cached_user_tickets');
      if (cached) {
        setTickets(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarTickets();
  };

  const ticketsPorEstado = tickets.filter((t) => {
    if (filtroEstado === 'pendientes') {
      return t.estado === 'abierto' || t.estado === 'en_proceso';
    }
    if (filtroEstado === 'resueltos') {
      return t.estado === 'finalizado' || t.estado === 'cerrado';
    }
    return true; // 'todos'
  });

  const ticketsFiltrados = ticketsPorEstado.filter((t) => {
    const texto = busqueda.toLowerCase().trim();
    if (!texto) return true;
    const area = t.area_nombre?.toLowerCase() || '';
    const desc = t.descripcion?.toLowerCase() || '';
    const id = t.id?.toString() || '';
    return area.includes(texto) || desc.includes(texto) || id.includes(texto);
  });

  const eliminarTicket = (id) => {
    Alert.alert(
      'Eliminar ticket',
      '¿Estás seguro de que quieres eliminar este ticket? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);
              const res = await fetch(`${API_URL}/api/tickets/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
              });
              clearTimeout(timeoutId);
              const data = await res.json();
              if (data.status === 'ok') {
                const updated = tickets.filter(t => t.id !== id);
                setTickets(updated);
                await AsyncStorage.setItem('cached_user_tickets', JSON.stringify(updated));
              } else {
                Alert.alert('Error', data.message || 'No se pudo eliminar el ticket.');
              }
            } catch (e) {
              // Sin conexión: eliminar localmente del caché
              const updated = tickets.filter(t => t.id !== id);
              setTickets(updated);
              await AsyncStorage.setItem('cached_user_tickets', JSON.stringify(updated));
            }
          },
        },
      ]
    );
  };

  const renderFiltroBoton = (label, valor) => {
    const activo = filtroEstado === valor;
    return (
      <TouchableOpacity
        style={[styles.filtroBtn, activo && styles.filtroBtnActivo]}
        onPress={() => setFiltroEstado(valor)}
      >
        <Text style={[styles.filtroBtnTexto, activo && styles.filtroBtnTextoActivo]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTicketItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TicketDetail', { id: item.id, ticketData: item })}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>#{item.id}</Text>
        <View style={styles.badgeRow}>
          <PriorityBadge priority={item.prioridad} />
          <View style={{ width: 6 }} />
          <StatusBadge status={item.estado} small />
        </View>
      </View>

      <Text style={styles.cardArea}>🏢 {item.area_nombre}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.descripcion}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>
          📅 {formatearFecha(item.created_at || item.fecha_creacion)}
        </Text>
        <View style={styles.cardFooterActions}>
          <TouchableOpacity
            onPress={() => eliminarTicket(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.btnEliminar}>🗑️ Eliminar</Text>
          </TouchableOpacity>
          <Text style={styles.cardVerMas}>Ver estado ➔</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Mis Tickets"
        onMenuPress={() => setDrawerVisible(true)}
        onHomePress={() => navigation.navigate('UserHome')}
      />

      <View style={styles.container}>
        {/* Barra de Búsqueda */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por número o descripción..."
            placeholderTextColor={COLORS.textSecondary}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros de Estado Simplificados */}
        <View style={styles.filtrosRow}>
          {renderFiltroBoton('Todos', 'todos')}
          {renderFiltroBoton('Pendientes', 'pendientes')}
          {renderFiltroBoton('Resueltos', 'resueltos')}
        </View>

        {/* Lista de Tickets */}
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={ticketsFiltrados}
            keyExtractor={item => item.id.toString()}
            renderItem={renderTicketItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>📋</Text>
                <Text style={styles.emptyTitle}>No hay solicitudes</Text>
                <Text style={styles.emptySubtitle}>
                  {busqueda
                    ? 'No se encontraron resultados con ese criterio'
                    : filtroEstado === 'pendientes'
                    ? 'No tienes fallas pendientes de atención'
                    : filtroEstado === 'resueltos'
                    ? 'No tienes reportes resueltos aún'
                    : 'Aún no has reportado fallas técnicas'}
                </Text>
                <TouchableOpacity
                  style={styles.btnNuevo}
                  onPress={() => navigation.navigate('CreateTicket')}
                >
                  <Text style={styles.btnNuevoText}>➕ Reportar una Falla</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      <UserDrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    paddingHorizontal: SIZES.md,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: 12,
    marginVertical: SIZES.sm,
    height: 46,
    borderWidth: 1,
    borderColor: '#D0DCF2',
    ...SHADOWS.small,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: SIZES.body, color: COLORS.textPrimary },
  filtrosRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SIZES.sm,
  },
  filtroBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#EEF2F8',
  },
  filtroBtnActivo: { backgroundColor: '#3266CC' },
  filtroBtnTexto: { fontSize: SIZES.caption, color: COLORS.textSecondary, fontWeight: '600' },
  filtroBtnTextoActivo: { color: COLORS.white, fontWeight: '700' },
  listContent: { paddingBottom: 20 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#3266CC',
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardId: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  cardArea: { fontSize: SIZES.small, color: '#3266CC', fontWeight: '600', marginBottom: 4 },
  cardDesc: { fontSize: SIZES.caption, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: 11, color: '#8898AA' },
  cardVerMas: { fontSize: SIZES.small, color: '#3266CC', fontWeight: '700' },
  cardFooterActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnEliminar: { fontSize: SIZES.small, color: '#E53935', fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.textPrimary },
  emptySubtitle: { fontSize: SIZES.caption, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4, marginHorizontal: 20 },
  btnNuevo: {
    marginTop: SIZES.md,
    backgroundColor: '#3266CC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  btnNuevoText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.small },
});
