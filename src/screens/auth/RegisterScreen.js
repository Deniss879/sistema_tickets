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
import { COLORS, FONTS, SIZES } from '../../theme';
import { WaveTop, WaveBottom } from '../../components/decorations/Waves';

import { API_URL } from '../../config/api';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    genero: '',
    correo: '',
    contraseña: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { nombre, apellidoPaterno, correo, contraseña } = form;

    if (!nombre.trim() || !apellidoPaterno.trim() || !correo.trim() || !contraseña.trim()) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Error al registrar usuario.');
        return;
      }

      navigation.navigate('AccountCreated');
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

          {/* Title */}
          <Text style={styles.screenTitle}>Registrar usuario</Text>

          {/* Form */}
          <View style={styles.formSection}>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor={COLORS.textSecondary}
              value={form.nombre}
              onChangeText={(val) => handleChange('nombre', val)}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido Paterno"
              placeholderTextColor={COLORS.textSecondary}
              value={form.apellidoPaterno}
              onChangeText={(val) => handleChange('apellidoPaterno', val)}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido Materno"
              placeholderTextColor={COLORS.textSecondary}
              value={form.apellidoMaterno}
              onChangeText={(val) => handleChange('apellidoMaterno', val)}
            />
            <TextInput
              style={styles.input}
              placeholder="Genero"
              placeholderTextColor={COLORS.textSecondary}
              value={form.genero}
              onChangeText={(val) => handleChange('genero', val)}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo"
              placeholderTextColor={COLORS.textSecondary}
              value={form.correo}
              onChangeText={(val) => handleChange('correo', val)}
              keyboardType="email-address"
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
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textWhite} />
              ) : (
                <Text style={styles.buttonText}>Registrar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Back link */}
          <View style={styles.linkSection}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>Regresar</Text>
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
    marginBottom: SIZES.lg,
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
  screenTitle: {
    fontSize: SIZES.h2,
    ...FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.lg,
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
  linkSection: {
    alignItems: 'center',
    marginTop: SIZES.lg,
  },
  link: {
    color: COLORS.primary,
    fontSize: SIZES.caption,
    ...FONTS.medium,
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
