import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme';
import { AppHeader, StatusBadge } from '../../components/common';
import { API_URL } from '../../config/api';
import UserDrawerMenu from './UserDrawerMenu';

const DEFAULT_USER_TICKETS = [
  {
    id: 1,
    folio: 'TCK-001',
    area_nombre: 'Presidencia',
    categoria_nombre: 'Soporte Técnico',
    descripcion: 'Mantenimiento preventivo e instalación de antivirus',
    estado: 'en_proceso',
    prioridad: 'alta',
    created_at: '2026-11-18 10:00:00',
    fecha_creacion: '18/11/2026',
  },
  {
    id: 2,
    folio: 'TCK-002',
    area_nombre: 'Tesorería',
    categoria_nombre: 'Redes e Internet',
    descripcion: 'Falla intermitente en conexión de red e impresora',
    estado: 'abierto',
    prioridad: 'media',
    created_at: '2026-11-17 14:30:00',
    fecha_creacion: '17/11/2026',
  },
  {
    id: 3,
    folio: 'TCK-003',
    area_nombre: 'Obras Públicas',
    categoria_nombre: 'Software',
    descripcion: 'Actualización de sistema contable y configuración',
    estado: 'finalizado',
    prioridad: 'normal',
    created_at: '2026-11-15 09:15:00',
    fecha_creacion: '15/11/2026',
  },
];

const formatearFecha = (fechaRaw) => {
  if (!fechaRaw) return 'Reciente';
  if (typeof fechaRaw === 'string' && fechaRaw.includes('/')) return fechaRaw;
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

const calcularResumen = (lista) => ({
  total: lista.length,
  abiertos: lista.filter((t) => t.estado === 'abierto').length,
  en_proceso: lista.filter((t) => t.estado === 'en_proceso').length,
  finalizados: lista.filter((t) => t.estado === 'finalizado').length,
});

export default function UserHomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const [usuario, setUsuario] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [resumen, setResumen] = useState({
    total: 0,
    abiertos: 0,
    en_proceso: 0,
    finalizados: 0,
  });
  const [misTickets, setMisTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarDatosUsuario = async () => {
    try {
      const userStr = await AsyncStorage.getItem('usuario');
      if (userStr) setUsuario(JSON.parse(userStr));

      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Intentar consultar backend con timeout de 3 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      // Cargar resumen de tickets
      const resDash = await fetch(`${API_URL}/api/tickets/dashboard`, {
        headers,
        signal: controller.signal,
      });
      const dataDash = await resDash.json();
      if (dataDash.status === 'ok' && dataDash.data?.resumen) {
        setResumen(dataDash.data.resumen);
      }

      // Cargar mis tickets
      const resTickets = await fetch(`${API_URL}/api/tickets`, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const dataTickets = await resTickets.json();
      if (dataTickets.status === 'ok' && Array.isArray(dataTickets.data)) {
        setMisTickets(dataTickets.data);
        await AsyncStorage.setItem('cached_user_tickets', JSON.stringify(dataTickets.data));
      }
    } catch (error) {
      console.log('Modo local en UserHomeScreen:', error);
      // Recuperar de la memoria local de tickets
      const cached = await AsyncStorage.getItem('cached_user_tickets');
      const lista = cached ? JSON.parse(cached) : DEFAULT_USER_TICKETS;
      setMisTickets(lista);
      setResumen(calcularResumen(lista));
      if (!cached) {
        await AsyncStorage.setItem('cached_user_tickets', JSON.stringify(DEFAULT_USER_TICKETS));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatosUsuario();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Atención de Sistemas"
        onMenuPress={() => setDrawerVisible(true)}
        onNotificationPress={() => setDrawerVisible(true)}
        onHomePress={() => cargarDatosUsuario()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: isSmallScreen ? 12 : 16 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.contentWrapper}>
          {/* Banner de Bienvenida del Usuario */}
          <View style={styles.userBanner}>
            <Text style={styles.bannerGreeting}>Bienvenido(a)</Text>
            <Text style={[styles.bannerName, isSmallScreen && { fontSize: 20 }]}>
              {usuario?.nombre || 'Usuario'}
            </Text>
            <View style={styles.badgeArea}>
              <Text style={styles.badgeAreaText}>
                🏢 {usuario?.area_nombre || 'Área Municipal'}
              </Text>
            </View>
          </View>

          {/* CONTADORES DE ESTADO (RESPONSIVOS) */}
          <Text style={styles.sectionHeader}>Estado de Mis Tickets</Text>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.statBox, { borderLeftColor: COLORS.info }]}
              onPress={() => navigation.navigate('TicketList', { estado: 'pendientes' })}
              activeOpacity={0.7}
            >
              <Text style={styles.statIcon}>📬</Text>
              <Text style={[styles.statNum, isSmallScreen && { fontSize: 18 }]}>
                {resumen.abiertos || 0}
              </Text>
              <Text style={styles.statTag} numberOfLines={1}>
                Nuevos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statBox, { borderLeftColor: COLORS.warning }]}
              onPress={() => navigation.navigate('TicketList', { estado: 'pendientes' })}
              activeOpacity={0.7}
            >
              <Text style={styles.statIcon}>⏳</Text>
              <Text style={[styles.statNum, isSmallScreen && { fontSize: 18 }]}>
                {resumen.en_proceso || 0}
              </Text>
              <Text style={styles.statTag} numberOfLines={1}>
                En Atención
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statBox, { borderLeftColor: COLORS.success }]}
              onPress={() => navigation.navigate('TicketList', { estado: 'resueltos' })}
              activeOpacity={0.7}
            >
              <Text style={styles.statIcon}>✅</Text>
              <Text style={[styles.statNum, isSmallScreen && { fontSize: 18 }]}>
                {resumen.finalizados || 0}
              </Text>
              <Text style={styles.statTag} numberOfLines={1}>
                Resueltos
              </Text>
            </TouchableOpacity>
          </View>

          {/* LISTADO DE REPORTES RECIENTES */}
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeader}>Mis Reportes Recientes</Text>
            {misTickets.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('TicketList')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.linkVerTodos}>Ver todos ➔</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginVertical: 30 }}
            />
          ) : misTickets.length > 0 ? (
            misTickets.slice(0, 5).map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.ticketCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('TicketDetail', { id: t.id, ticketData: t })}
              >
                <View style={styles.ticketCardHeader}>
                  <Text style={styles.ticketFolio}>Folio #{t.id}</Text>
                  <StatusBadge status={t.estado} small />
                </View>
                <Text style={styles.ticketDesc} numberOfLines={2}>
                  {t.descripcion}
                </Text>
                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketFecha}>
                    📅 {formatearFecha(t.created_at || t.fecha_creacion)}
                  </Text>
                  <View style={styles.ticketFooterRight}>
                    <Text style={styles.ticketTipo}>
                      {t.tipo_intervencion === 'in_situ'
                        ? '🏃 En mi oficina'
                        : '📦 En Sistemas'}
                    </Text>
                    <Text style={styles.ticketVerDetalle}>Ver detalle ➔</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📋</Text>
              <Text style={styles.emptyTitle}>No tienes reportes levantados</Text>
              <Text style={styles.emptySubtitle}>
                Cuando tengas alguna falla técnica en tu departamento, abre el menú
                lateral y pulsa en "Levantar ticket" para solicitar atención de Sistemas.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Menú Lateral Deslizable */}
      <UserDrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingTop: SIZES.md,
    paddingBottom: 30,
    flexGrow: 1,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  userBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.medium,
  },
  bannerGreeting: {
    color: COLORS.primaryLight,
    fontSize: SIZES.caption,
    fontWeight: '500',
  },
  bannerName: {
    color: COLORS.textWhite,
    fontSize: SIZES.h2,
    fontWeight: '700',
    marginTop: 2,
  },
  badgeArea: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    marginTop: 8,
  },
  badgeAreaText: {
    color: COLORS.textWhite,
    fontSize: SIZES.caption,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
    marginTop: SIZES.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.sm,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statTag: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
    marginTop: SIZES.sm,
  },
  linkVerTodos: {
    fontSize: SIZES.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  ticketCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: '#E8EFFB',
    ...SHADOWS.small,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketFolio: {
    fontSize: SIZES.body,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ticketDesc: {
    fontSize: SIZES.caption,
    color: COLORS.textDark,
    lineHeight: 18,
    marginBottom: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F4FF',
    paddingTop: 8,
  },
  ticketFecha: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  ticketFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketTipo: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  ticketVerDetalle: {
    fontSize: SIZES.small,
    color: '#3266CC',
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.xl,
    alignItems: 'center',
    marginVertical: SIZES.sm,
    borderWidth: 1,
    borderColor: '#D6E4FF',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: SIZES.body,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
