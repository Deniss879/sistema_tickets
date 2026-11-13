import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { AppHeader } from '../../components/common';

export default function SettingsScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    const userStr = await AsyncStorage.getItem('usuario');
    if (userStr) setUsuario(JSON.parse(userStr));
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir del sistema?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['token', 'usuario']);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
  };

  const renderOpcion = (icono, titulo, subtitulo, onPress) => (
    <TouchableOpacity style={styles.opcionItem} onPress={onPress}>
      <Text style={styles.opcionIcono}>{icono}</Text>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.opcionTitulo}>{titulo}</Text>
        {subtitulo && <Text style={styles.opcionSubtitulo}>{subtitulo}</Text>}
      </View>
      <Text style={styles.opcionChevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Configuración"
        onMenuPress={() => navigation.openDrawer ? navigation.openDrawer() : navigation.goBack()}
        onNotificationPress={() => {}}
        onHomePress={() => navigation.navigate('Dashboard')}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Perfil del Usuario */}
        <View style={styles.perfilCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.perfilNombre}>{usuario?.nombre || 'Usuario'}</Text>
            <Text style={styles.perfilUsuario}>@{usuario?.usuario}</Text>
            <Text style={styles.perfilRol}>
              {usuario?.rol === 'admin' ? '🛡️ Administrador / Técnico' : `🏢 ${usuario?.area_nombre || 'Área'}`}
            </Text>
          </View>
        </View>

        {/* Opciones */}
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.card}>
          {renderOpcion('🔔', 'Notificaciones', 'Alertas y cambios de estatus', () =>
            Alert.alert('Notificaciones', 'Notificaciones del sistema activas')
          )}
          {renderOpcion('⏰', 'Horario de Atención', 'Lunes a Viernes de 9:00 a 16:00', () =>
            Alert.alert('Horario de Operación', 'El sistema restringe la creación de tickets fuera del horario laboral oficial.')
          )}
        </View>

        <Text style={styles.sectionTitle}>Información del Sistema</Text>
        <View style={styles.card}>
          {renderOpcion('🏛️', 'Ayuntamiento', 'Tezontepec de Aldama, Hgo.', () => {})}
          {renderOpcion('ℹ️', 'Acerca de', 'Versión 1.0.0 (Expo React Native)', () =>
            Alert.alert('Sistema de Tickets', 'Desarrollado para el Área de Sistemas de Tezontepec de Aldama.')
          )}
        </View>

        {/* Botón Salir */}
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
          <Text style={styles.btnLogoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SIZES.md },
  perfilCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26, color: COLORS.white, fontWeight: '700' },
  perfilNombre: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.textPrimary },
  perfilUsuario: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  perfilRol: { fontSize: SIZES.small, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: SIZES.caption, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 8, marginTop: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  opcionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  opcionIcono: { fontSize: 20 },
  opcionTitulo: { fontSize: SIZES.body, fontWeight: '600', color: COLORS.textDark },
  opcionSubtitulo: { fontSize: SIZES.small, color: COLORS.textSecondary, marginTop: 2 },
  opcionChevron: { fontSize: 20, color: COLORS.textSecondary },
  btnLogout: {
    backgroundColor: COLORS.danger,
    height: 50,
    borderRadius: SIZES.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    ...SHADOWS.small,
  },
  btnLogoutText: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '700' },
});
