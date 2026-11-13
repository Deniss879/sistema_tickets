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
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { AppHeader } from '../../components/common';

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
                <Text style={styles.statLabel}>Total Solicitudes</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: '#E6FFFA' }]}>
                <Text style={[styles.statNum, { color: COLORS.success }]}>
                  {reporte.resumen?.finalizados || 0}
                </Text>
                <Text style={styles.statLabel}>Solucionados</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: '#FEFCBF' }]}>
                <Text style={[styles.statNum, { color: '#B7791F' }]}>
                  {reporte.resumen?.en_proceso || 0}
                </Text>
                <Text style={styles.statLabel}>En Proceso</Text>
              </View>
            </View>

            {/* Desglose por Área */}
            <Text style={styles.sectionTitle}>Solicitudes por Área Municipal</Text>
            <View style={styles.card}>
              {reporte.por_area && reporte.por_area.length > 0 ? (
                reporte.por_area.map((a, i) => (
                  <View key={i} style={styles.rowItem}>
                    <Text style={styles.itemName}>{a.area}</Text>
                    <View style={styles.countsContainer}>
                      <Text style={styles.badgeResueltos}>{a.resueltos} resueltos</Text>
                      <Text style={styles.badgeTotal}>{a.total} total</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ color: COLORS.textSecondary }}>Sin datos registrados</Text>
              )}
            </View>

            {/* Desglose por Categoría */}
            <Text style={styles.sectionTitle}>Fallas Más Comunes</Text>
            <View style={styles.card}>
              {reporte.por_categoria && reporte.por_categoria.length > 0 ? (
                reporte.por_categoria.map((c, i) => (
                  <View key={i} style={styles.rowItem}>
                    <Text style={styles.itemName}>{c.categoria}</Text>
                    <Text style={styles.catCount}>{c.total} reportes</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: COLORS.textSecondary }}>Sin datos registrados</Text>
              )}
            </View>

            {/* Botón Exportar */}
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={() => Alert.alert('Exportar Informe', 'Reporte listo para ser impreso o enviado por WhatsApp a Presidencia')}
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
    padding: 12,
    borderRadius: SIZES.radiusMd,
    marginHorizontal: 3,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statNum: { fontSize: 24, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.textPrimary, marginVertical: 10 },
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
