import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { API_URL } from '../../config/api';
import { navigationRef, navigateToLogin } from '../../navigation/navigationRef';

// Ícono de Casa en contorno
function HomeOutlineIcon({ size = 26, color = '#1E293B' }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 10.5L12 3l9 7.5v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Path d="M9 22V12h6v10" />
    </Svg>
  );
}

export default function UserDrawerMenu({ navigation, visible = false, onClose }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Responsividad
  const isLaptop = screenWidth >= 768;
  const isShortScreen = screenHeight < 740;
  const drawerWidth = isLaptop ? 320 : Math.min(Math.round(screenWidth * 0.82), 310);

  // Escalamiento dinámico
  const logoWidth = isShortScreen ? 115 : 138;
  const logoHeight = isShortScreen ? 85 : 105;
  const pillHeight = isShortScreen ? 40 : 46;
  const pillMarginBottom = isShortScreen ? 7 : 10;
  const pillFontSize = isShortScreen ? 14 : 15.5;

  const [usuario, setUsuario] = useState(null);

  // Animación lateral
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Sub-diálogos (overlays dentro del Modal, NO modales anidados)
  const [modalNotifVisible, setModalNotifVisible] = useState(false);
  const [modalPerfilVisible, setModalPerfilVisible] = useState(false);
  const [modalAyudaVisible, setModalAyudaVisible] = useState(false);
  const [modalAcercaVisible, setModalAcercaVisible] = useState(false);

  const [notificaciones, setNotificaciones] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('usuario').then((res) => {
      if (res) {
        try { setUsuario(JSON.parse(res)); } catch (e) {}
      }
    });
  }, []);

  // Animación cuando visible cambia
  useEffect(() => {
    if (visible) {
      // Resetear antes de animar
      slideAnim.setValue(-drawerWidth);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, drawerWidth]);

  const handleClose = () => {
    // Cerrar sub-diálogos primero
    setModalNotifVisible(false);
    setModalPerfilVisible(false);
    setModalAyudaVisible(false);
    setModalAcercaVisible(false);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -drawerWidth,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  const handleNav = (screenName) => {
    handleClose();
    setTimeout(() => {
      if (navigation) navigation.navigate(screenName);
    }, 200);
  };

  const handleCargarNotificaciones = async () => {
    setModalNotifVisible(true);
    setLoadingNotif(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_URL}/api/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const json = await res.json();
      if (json.status === 'ok') {
        setNotificaciones(json.data || []);
      } else {
        setNotificaciones([{ id: 1, mensaje: 'Tu ticket fue recibido por el área de Sistemas.', fecha: 'Hoy', leida: false }]);
      }
    } catch (e) {
      setNotificaciones([{ id: 1, mensaje: 'Tu ticket fue recibido por el área de Sistemas.', fecha: 'Hoy', leida: false }]);
    } finally {
      setLoadingNotif(false);
    }
  };

  const handleLogout = async () => {
    try { await AsyncStorage.multiRemove(['token', 'usuario', 'role']); } catch (e) {}
    handleClose();
    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Auth' }] });
      } else {
        const rootNav = navigation?.getParent?.() || navigation;
        if (rootNav?.reset) {
          rootNav.reset({ index: 0, routes: [{ name: 'Auth' }] });
        } else {
          navigateToLogin();
        }
      }
    }, 200);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
      hardwareAccelerated={true}
    >
      {/* Fondo oscuro semitransparente */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Panel lateral deslizable */}
      <Animated.View
        style={[
          styles.drawerContainer,
          {
            width: drawerWidth,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Padding manual para status bar en Android */}
        <View
          style={[
            styles.drawerInner,
            {
              paddingTop:
                Platform.OS === 'android'
                  ? (StatusBar.currentHeight || 24) + 6
                  : 10,
            },
          ]}
        >
          {/* Botón Casa (Home) */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.btnHomeTop}
              onPress={() => handleNav('UserHome')}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <HomeOutlineIcon size={26} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoSection}>
            <Image
              source={require('../../../assets/logo_sistemas.png')}
              style={{ width: logoWidth, height: logoHeight }}
              resizeMode="contain"
            />
          </View>

          {/* Opciones */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.menuScroll}
            showsVerticalScrollIndicator={false}
            bounces={true}
            nestedScrollEnabled={true}
          >
            {/* Panel Principal */}
            <TouchableOpacity
              style={[styles.pillButton, { height: pillHeight, marginBottom: pillMarginBottom }]}
              activeOpacity={0.8}
              onPress={() => handleNav('UserHome')}
            >
              <Text style={[styles.pillButtonText, { fontSize: pillFontSize }]}>
                Panel Principal
              </Text>
            </TouchableOpacity>

            {/* Levantar ticket */}
            <TouchableOpacity
              style={[styles.pillButton, { height: pillHeight, marginBottom: pillMarginBottom }]}
              activeOpacity={0.8}
              onPress={() => handleNav('CreateTicket')}
            >
              <Text style={[styles.pillButtonText, { fontSize: pillFontSize }]}>
                Levantar ticket
              </Text>
            </TouchableOpacity>

            {/* Mis tickets */}
            <TouchableOpacity
              style={[styles.pillButton, { height: pillHeight, marginBottom: pillMarginBottom }]}
              activeOpacity={0.8}
              onPress={() => handleNav('TicketList')}
            >
              <Text style={[styles.pillButtonText, { fontSize: pillFontSize }]}>
                Mis tickets
              </Text>
            </TouchableOpacity>

            {/* Notificaciones */}
            <TouchableOpacity
              style={[styles.pillButton, { height: pillHeight, marginBottom: pillMarginBottom }]}
              activeOpacity={0.8}
              onPress={handleCargarNotificaciones}
            >
              <Text style={[styles.pillButtonText, { fontSize: pillFontSize }]}>
                Notificaciones
              </Text>
            </TouchableOpacity>

            {/* Mi perfil */}
            <TouchableOpacity
              style={[styles.pillButton, { height: pillHeight, marginBottom: pillMarginBottom }]}
              activeOpacity={0.8}
              onPress={() => setModalPerfilVisible(true)}
            >
              <Text style={[styles.pillButtonText, { fontSize: pillFontSize }]}>
                Mi perfil
              </Text>
            </TouchableOpacity>

            {/* Ayuda */}
            <TouchableOpacity
              style={[styles.pillButton, { height: pillHeight, marginBottom: pillMarginBottom }]}
              activeOpacity={0.8}
              onPress={() => setModalAyudaVisible(true)}
            >
              <Text style={[styles.pillButtonText, { fontSize: pillFontSize }]}>
                Ayuda
              </Text>
            </TouchableOpacity>

            {/* Acerca de */}
            <TouchableOpacity
              style={[styles.pillButton, { height: pillHeight, marginBottom: pillMarginBottom }]}
              activeOpacity={0.8}
              onPress={() => setModalAcercaVisible(true)}
            >
              <Text style={[styles.pillButtonText, styles.underlineText, { fontSize: pillFontSize }]}>
                Acerca de
              </Text>
            </TouchableOpacity>

            {/* Espaciador */}
            <View style={{ minHeight: isShortScreen ? 12 : 20 }} />

            {/* Salir */}
            <TouchableOpacity
              style={[styles.pillButton, { height: pillHeight, marginBottom: 8 }]}
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <Text style={[styles.pillButtonText, { fontSize: pillFontSize }]}>
                Salir
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>

      {/* ── SUB-DIÁLOGOS (overlays dentro del mismo Modal) ── */}

      {/* NOTIFICACIONES */}
      {modalNotifVisible && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔔 Notificaciones</Text>
              <TouchableOpacity onPress={() => setModalNotifVisible(false)}>
                <Text style={styles.modalCloseText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>
            {loadingNotif ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 30 }} />
            ) : notificaciones.length > 0 ? (
              <ScrollView style={{ maxHeight: Math.min(360, screenHeight * 0.5) }}>
                {notificaciones.map((n, idx) => (
                  <View key={idx} style={styles.notifItem}>
                    <Text style={styles.notifMensaje}>{n.mensaje}</Text>
                    <Text style={styles.notifFecha}>📅 {n.fecha || 'Hoy'}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyModalView}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📭</Text>
                <Text style={styles.emptyModalTitle}>No tienes notificaciones pendientes</Text>
                <Text style={styles.emptyModalSub}>
                  Cuando un técnico cambie el estado de tus tickets o agregue notas, te aparecerán aquí.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* MI PERFIL */}
      {modalPerfilVisible && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👤 Mi Perfil</Text>
              <TouchableOpacity onPress={() => setModalPerfilVisible(false)}>
                <Text style={styles.modalCloseText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.perfilInfoBox}>
              <View style={styles.perfilAvatar}>
                <Text style={styles.perfilAvatarText}>
                  {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'S'}
                </Text>
              </View>
              <Text style={styles.perfilNombre}>{usuario?.nombre || 'Samantha Hernandez'}</Text>
              <Text style={styles.perfilUsuarioTag}>@{usuario?.usuario || 'samantha'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Área / Depto:</Text>
              <Text style={styles.infoValue}>🏢 {usuario?.area_nombre || 'Área Municipal'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo de Cuenta:</Text>
              <Text style={styles.infoValue}>Personal Solicitante (Usuario)</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Municipio:</Text>
              <Text style={styles.infoValue}>Tezontepec de Aldama, Hgo.</Text>
            </View>
            <TouchableOpacity
              style={[styles.pillButton, { marginTop: 18, height: pillHeight }]}
              onPress={() => setModalPerfilVisible(false)}
            >
              <Text style={styles.pillButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* AYUDA */}
      {modalAyudaVisible && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>❓ Centro de Ayuda</Text>
              <TouchableOpacity onPress={() => setModalAyudaVisible(false)}>
                <Text style={styles.modalCloseText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: Math.min(380, screenHeight * 0.5) }}>
              <Text style={styles.ayudaSubtitle}>¿Cómo levantar un reporte?</Text>
              <Text style={styles.ayudaText}>
                1. Abre el menú lateral y pulsa "Levantar ticket".{'\n'}
                2. Tu área se selecciona automáticamente.{'\n'}
                3. Elige el tipo de problema (computadora, impresora, internet).{'\n'}
                4. Describe qué falla y pulsa Enviar reporte.
              </Text>
              <Text style={[styles.ayudaSubtitle, { marginTop: 14 }]}>Horario de Atención:</Text>
              <Text style={styles.ayudaText}>
                ⏰ Lunes a Viernes de 9:00 AM a 4:00 PM{'\n'}
                📍 Presidencia Municipal de Tezontepec de Aldama
              </Text>
              <Text style={[styles.ayudaSubtitle, { marginTop: 14 }]}>Soporte Directo:</Text>
              <Text style={styles.ayudaText}>
                Para fallas críticas de red que afecten cajas o recaudación, acude directamente al área de Sistemas.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.pillButton, { marginTop: 16, height: pillHeight }]}
              onPress={() => setModalAyudaVisible(false)}
            >
              <Text style={styles.pillButtonText}>Cerrar Ayuda</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ACERCA DE */}
      {modalAcercaVisible && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ℹ️ Acerca de</Text>
              <TouchableOpacity onPress={() => setModalAcercaVisible(false)}>
                <Text style={styles.modalCloseText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <Image
                source={require('../../../assets/logo_sistemas.png')}
                style={{ width: 120, height: 95 }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.acercaDesc}>
              Sistema de Gestión y Seguimiento de Incidencias Técnicas.{'\n'}
              Diseñado para la atención oportuna de equipos de cómputo, red y software de las áreas municipales.
            </Text>
            <View style={styles.versionBox}>
              <Text style={styles.versionText}>Versión 1.0.0 (Móvil)</Text>
              <Text style={styles.versionSub}>H. Ayuntamiento de Tezontepec de Aldama</Text>
            </View>
            <TouchableOpacity
              style={[styles.pillButton, { marginTop: 16, height: pillHeight }]}
              onPress={() => setModalAcercaVisible(false)}
            >
              <Text style={styles.pillButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#F5F7FC',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  drawerInner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
    paddingRight: 6,
  },
  btnHomeTop: {
    padding: 6,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  menuScroll: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  pillButton: {
    backgroundColor: '#3266CC',
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  pillButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  dialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 440,
    borderRadius: 18,
    padding: 20,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
    paddingBottom: 12,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B3A8C',
  },
  modalCloseText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  notifItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notifMensaje: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  notifFecha: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  emptyModalView: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptyModalSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  perfilInfoBox: {
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 14,
  },
  perfilAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  perfilAvatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B3A8C',
  },
  perfilNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  perfilUsuarioTag: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  ayudaSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  ayudaText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
  },
  acercaDesc: {
    fontSize: 13.5,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  versionBox: {
    backgroundColor: '#F8FAFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B3A8C',
  },
  versionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
