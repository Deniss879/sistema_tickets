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
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme';
import { AppHeader } from '../../components/common';

import { API_URL } from '../../config/api';

export default function DashboardScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [resumen, setResumen] = useState({
    total: 0,
    abiertos: 0,
    en_proceso: 0,
    finalizados: 0,
    alta_prioridad_pendientes: 0,
    sla_excedidos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarDatos = async () => {
    try {
      const userStr = await AsyncStorage.getItem('usuario');
      if (userStr) {
        setUsuario(JSON.parse(userStr));
      }
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tickets/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status === 'ok' && data.data && data.data.resumen) {
        setResumen(data.data.resumen);
      }
    } catch (error) {
      console.log('Error dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Panel Principal"
        onMenuPress={() => navigation.openDrawer ? navigation.openDrawer() : navigation.navigate('DrawerMenu')}
        onNotificationPress={() => navigation.navigate('Settings')}
        onHomePress={() => cargarDatos()}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Banner de Bienvenida */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeSub}>Bienvenido(a)</Text>
          <Text style={styles.welcomeName}>{usuario ? usuario.nombre : 'Usuario'}</Text>
          <Text style={styles.welcomeRole}>
            {usuario?.rol === 'admin' ? '🛡️ Administrador / Técnico' : `🏢 ${usuario?.area_nombre || 'Área Municipal'}`}
          </Text>
        </View>

        {/* Sección de Indicadores */}
        <Text style={styles.sectionTitle}>Resumen de Tickets</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.grid}>
            {/* Abiertos */}
            <TouchableOpacity
              style={[styles.statCard, { borderLeftColor: COLORS.info }]}
              onPress={() => navigation.navigate('TicketList', { estado: 'abierto' })}
            >
              <Text style={styles.statEmoji}>📬</Text>
              <Text style={styles.statCount}>{resumen.abiertos || 0}</Text>
              <Text style={styles.statLabel}>Abiertos</Text>
            </TouchableOpacity>

            {/* En Proceso */}
            <TouchableOpacity
              style={[styles.statCard, { borderLeftColor: COLORS.warning }]}
              onPress={() => navigation.navigate('TicketList', { estado: 'en_proceso' })}
            >
              <Text style={styles.statEmoji}>⏳</Text>
              <Text style={styles.statCount}>{resumen.en_proceso || 0}</Text>
              <Text style={styles.statLabel}>En Proceso</Text>
            </TouchableOpacity>

            {/* Finalizados */}
            <TouchableOpacity
              style={[styles.statCard, { borderLeftColor: COLORS.success }]}
              onPress={() => navigation.navigate('TicketList', { estado: 'finalizado' })}
            >
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={styles.statCount}>{resumen.finalizados || 0}</Text>
              <Text style={styles.statLabel}>Finalizados</Text>
            </TouchableOpacity>

            {/* Alta Prioridad */}
            <TouchableOpacity
              style={[styles.statCard, { borderLeftColor: COLORS.danger }]}
              onPress={() => navigation.navigate('TicketList', { prioridad: 'alta' })}
            >
              <Text style={styles.statEmoji}>🚨</Text>
              <Text style={[styles.statCount, { color: COLORS.danger }]}>
                {resumen.alta_prioridad_pendientes || 0}
              </Text>
              <Text style={styles.statLabel}>Alta Prioridad</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Acciones Rápidas */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateTicket')}
          >
            <Text style={styles.actionButtonIcon}>➕</Text>
            <Text style={styles.actionButtonText}>Levantar Ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TicketList')}
          >
            <Text style={styles.actionButtonIcon}>📋</Text>
            <Text style={styles.actionButtonText}>Ver Todos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EquipmentList')}
          >
            <Text style={styles.actionButtonIcon}>🖥️</Text>
            <Text style={styles.actionButtonText}>Equipos</Text>
          </TouchableOpacity>

          {usuario?.rol === 'admin' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Reports')}
            >
              <Text style={styles.actionButtonIcon}>📊</Text>
              <Text style={styles.actionButtonText}>Reportes</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SIZES.md,
  },
  welcomeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
    ...SHADOWS.medium,
  },
  welcomeSub: {
    color: COLORS.primaryLight,
    fontSize: SIZES.caption,
    fontWeight: '500',
  },
  welcomeName: {
    color: COLORS.textWhite,
    fontSize: SIZES.h2,
    fontWeight: '700',
    marginTop: 2,
  },
  welcomeRole: {
    color: COLORS.textWhite,
    fontSize: SIZES.body,
    marginTop: 4,
    opacity: 0.9,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.h4,
    fontWeight: '700',
    marginBottom: SIZES.sm,
    marginTop: SIZES.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  statCard: {
    backgroundColor: COLORS.white,
    width: '48%',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    borderLeftWidth: 5,
    ...SHADOWS.small,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statCount: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: COLORS.inputBg,
    width: '48%',
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: '#B8CFFC',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: SIZES.caption,
  },
});
