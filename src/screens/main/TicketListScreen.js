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
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { AppHeader, StatusBadge, PriorityBadge } from '../../components/common';

import { API_URL } from '../../config/api';

export default function TicketListScreen({ route, navigation }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState(route?.params?.estado || 'todos');
  const [busqueda, setBusqueda] = useState('');

  const cargarTickets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      let url = `${API_URL}/api/tickets`;
      if (filtroEstado !== 'todos') {
        url += `?estado=${filtroEstado}`;
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setTickets(data.data || []);
      }
    } catch (error) {
      console.log('Error al cargar tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarTickets();
  }, [filtroEstado]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarTickets();
  };

  const ticketsFiltrados = tickets.filter(t => {
    const texto = busqueda.toLowerCase();
    const area = t.area_nombre?.toLowerCase() || '';
    const desc = t.descripcion?.toLowerCase() || '';
    const id = t.id?.toString() || '';
    return area.includes(texto) || desc.includes(texto) || id.includes(texto);
  });

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
      onPress={() => navigation.navigate('TicketDetail', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>#{item.id}</Text>
        <View style={styles.badgeRow}>
          <PriorityBadge priority={item.prioridad} />
          <View style={{ width: 6 }} />
          <StatusBadge status={item.estado} small />
        </View>
      </View>

      <Text style={styles.cardArea}>{item.area_nombre}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.descripcion}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>
          📅 {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.cardIntervencion}>
          {item.tipo_intervencion === 'in_situ' ? '🏃 In Situ' : '📦 Traslado'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Gestión de Tickets"
        onMenuPress={() => navigation.openDrawer ? navigation.openDrawer() : navigation.goBack()}
        onNotificationPress={() => navigation.navigate('Settings')}
        onHomePress={() => navigation.navigate('Dashboard')}
      />

      {/* Filtros por Estado */}
      <View style={styles.filtrosRow}>
        {renderFiltroBoton('Todos', 'todos')}
        {renderFiltroBoton('Abierto', 'abierto')}
        {renderFiltroBoton('En Proceso', 'en_proceso')}
        {renderFiltroBoton('Finalizado', 'finalizado')}
      </View>

      {/* Barra de Búsqueda */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por área, folio o descripción..."
          placeholderTextColor={COLORS.textSecondary}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={ticketsFiltrados}
          keyExtractor={item => item.id.toString()}
          renderItem={renderTicketItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No se encontraron tickets</Text>
            </View>
          }
        />
      )}

      {/* Botón flotante para nuevo ticket */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTicket')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filtrosRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    justifyContent: 'space-between',
  },
  filtroBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  filtroBtnActivo: {
    backgroundColor: COLORS.primary,
  },
  filtroBtnTexto: {
    fontSize: SIZES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  filtroBtnTextoActivo: {
    color: COLORS.textWhite,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    marginHorizontal: SIZES.md,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    height: 44,
    marginBottom: SIZES.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SIZES.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.textPrimary,
  },
  listContent: {
    padding: SIZES.md,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardId: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardArea: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F8',
    paddingTop: 8,
  },
  cardDate: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  cardIntervencion: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SIZES.sm,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  fabText: {
    fontSize: 32,
    color: COLORS.textWhite,
    lineHeight: 34,
  },
});
