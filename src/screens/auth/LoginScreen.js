import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SIZES } from '../../theme';
import { WaveTop, WaveBottom } from '../../components/decorations/Waves';

import { API_URL } from '../../config/api';

const LoginScreen = ({ navigation, route }) => {
  const role = route?.params?.role || 'usuario';

  const [form, setForm] = useState({
    usuario: '',
    contraseña: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!form.usuario.trim() || !form.contraseña.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: form.usuario,
          contraseña: form.contraseña,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Credenciales incorrectas.');
        return;
      }

      // Store auth data
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user || {}));
      await AsyncStorage.setItem('role', role);

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Wave decorations */}
      <WaveTop />
      <WaveBottom />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoSmall}>
              <Text style={styles.logoEmoji}>🖥️🔧</Text>
            </View>
            <View style={styles.logoTextWrap}>
              <Text style={styles.logoTitle}>SISTEMAS</Text>
              <Text style={styles.logoSubtitle}>TEZONTEPEC DE ALDAMA</Text>
            </View>
          </View>

          {/* Welcome */}
          <Text style={styles.welcomeTitle}>Bienvenido</Text>

          {/* Form */}
          <View style={styles.formSection}>
            <TextInput
              style={styles.input}
              placeholder="Usuario"
              placeholderTextColor={COLORS.textSecondary}
              value={form.usuario}
              onChangeText={(val) => handleChange('usuario', val)}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.textSecondary}
              value={form.contraseña}
              onChangeText={(val) => handleChange('contraseña', val)}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textWhite} />
              ) : (
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Links */}
          <View style={styles.linksSection}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Registrar usuario</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.xxl + SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xxl,
  },
  logoSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  logoEmoji: {
    fontSize: 24,
  },
  logoTextWrap: {
    flex: 1,
  },
  logoTitle: {
    fontSize: SIZES.h4,
    ...FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 2,
  },
  logoSubtitle: {
    fontSize: SIZES.small,
    ...FONTS.medium,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  welcomeTitle: {
    fontSize: SIZES.h1,
    ...FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.xl,
  },
  formSection: {
    gap: SIZES.md,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radiusMd,
    height: SIZES.inputHeight,
    paddingHorizontal: SIZES.md,
    fontSize: SIZES.body,
    ...FONTS.regular,
    color: COLORS.textDark,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radiusFull,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.sm,
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: SIZES.h4,
    ...FONTS.semiBold,
  },
  linksSection: {
    alignItems: 'center',
    marginTop: SIZES.xl,
    gap: SIZES.md,
  },
  link: {
    color: COLORS.primary,
    fontSize: SIZES.caption,
    ...FONTS.medium,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
