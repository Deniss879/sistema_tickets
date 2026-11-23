import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../theme';

export default function DrawerMenu({ navigation }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('usuario').then(res => {
      if (res) setUsuario(JSON.parse(res));
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'usuario']);
    navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  const isAdmin = usuario?.rol === 'admin';

  const navItems = [
    { label: 'Panel Principal', icon: '🏠', screen: 'Dashboard' },
    { label: isAdmin ? 'Levantar Ticket' : 'Reportar una Falla', icon: '➕', screen: 'CreateTicket' },
    { label: isAdmin ? 'Gestión de Tickets' : 'Mis tickets', icon: '📋', screen: 'TicketList' },
    { label: isAdmin ? 'Bitácora de Equipos' : 'Equipos de Área', icon: '🖥️', screen: 'EquipmentList' },
    { label: 'Registrar Usuario', icon: '👤', screen: 'RegisterUser', adminOnly: true },
    { label: 'Reportes e Informes', icon: '📊', screen: 'Reports', adminOnly: true },
    { label: 'Configuración', icon: '⚙️', screen: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={{ fontSize: 24 }}>🖥️🔧</Text>
        </View>
        <Text style={styles.headerTitle}>SISTEMAS</Text>
        <Text style={styles.headerSub}>TEZONTEPEC DE ALDAMA</Text>
        <Text style={styles.userName}>{usuario?.nombre || 'Usuario'}</Text>
        <Text style={styles.userRole}>
          {isAdmin ? '🛡️ Administrador / Técnico' : `🏢 ${usuario?.area_nombre || 'Área Municipal'}`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.menuContainer}>
        {navItems.map((item, idx) => {
          if (item.adminOnly && usuario?.rol !== 'admin') return null;
          return (
            <TouchableOpacity
              key={idx}
              style={styles.menuButton}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
          <Text style={styles.btnLogoutText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.btnClose} onPress={() => navigation.goBack()}>
        <Text style={styles.btnCloseText}>✕ Cerrar Menú</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
    backgroundColor: COLORS.surface,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.textPrimary },
  headerSub: { fontSize: 10, color: COLORS.textSecondary, letterSpacing: 1.5, marginTop: 2 },
  userName: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textDark, marginTop: 8 },
  userRole: { fontSize: SIZES.small, color: COLORS.textSecondary, marginTop: 2 },
  menuContainer: { padding: SIZES.md },
  menuButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: SIZES.radiusSm,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  menuIcon: { fontSize: 18, marginRight: 12 },
  menuLabel: { fontSize: SIZES.body, color: COLORS.textWhite, fontWeight: '700' },
  btnLogout: {
    backgroundColor: '#FFF5F5',
    borderColor: COLORS.danger,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
    marginTop: 20,
  },
  btnLogoutText: { color: COLORS.danger, fontWeight: '700', fontSize: SIZES.body },
  btnClose: { paddingVertical: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEF2F8' },
  btnCloseText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: SIZES.caption },
});
