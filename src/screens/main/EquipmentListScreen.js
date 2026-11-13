import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { AppHeader } from '../../components/common';

import { API_URL } from '../../config/api';

export default function EquipmentListScreen({ navigation }) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const cargarEquipos = async () => {
    try {
      const userStr = await AsyncStorage.getItem('usuario');
      if (userStr) setUsuario(JSON.parse(userStr));

      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/equipos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setEquipos(data.data || []);
      }
    } catch (error) {
      console.log('Error equipos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarEquipos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarEquipos();
  };

  const getTipoEmoji = (tipo) => {
    if (tipo === 'impresora') return '🖨️';
    if (tipo === 'computadora') return '💻';
    return '🔌';
  };

  const renderEquipo = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.emoji}>{getTipoEmoji(item.tipo)}</Text>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.cardTitle}>{item.marca} {item.modelo}</Text>
          <Text style={styles.cardSub}>N/S: {item.numero_serie || 'Sin serie registrada'}</Text>
        </View>
        <View style={styles.tipoBadge}>
          <Text style={styles.tipoText}>{item.tipo.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.areaText}>🏢 {item.area_nombre || 'Sin área asignada'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Bitácora de Equipos"
        onMenuPress={() => navigation.openDrawer ? navigation.openDrawer() : navigation.goBack()}
        onNotificationPress={() => navigation.navigate('Settings')}
        onHomePress={() => navigation.navigate('Dashboard')}
      />

      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Historial y registro técnico de computadoras e impresoras atendidas.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={equipos}
            keyExtractor={item => item.id.toString()}
            renderItem={renderEquipo}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 40 }}>🖥️</Text>
                <Text style={styles.emptyText}>No hay equipos registrados en la bitácora</Text>
              </View>
            }
          />
        )}

        {usuario?.rol === 'admin' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('RegisterEquipment')}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SIZES.md },
  subtitle: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginBottom: SIZES.sm },
  listContent: { paddingBottom: 80 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 28 },
  cardTitle: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  cardSub: { fontSize: SIZES.small, color: COLORS.textSecondary, marginTop: 2 },
  tipoBadge: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
  },
  tipoText: { fontSize: 10, color: COLORS.primary, fontWeight: '700' },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EEF2F8',
    marginTop: 10,
    paddingTop: 8,
  },
  areaText: { fontSize: SIZES.caption, color: COLORS.textDark, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: COLORS.textSecondary, marginTop: 10, fontSize: SIZES.body },
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
  fabText: { fontSize: 32, color: COLORS.textWhite, lineHeight: 34 },
});
