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
  StatusBar,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../theme';
import { WaveTop, WaveBottom } from '../../components/decorations/Waves';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

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
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Recuperar contraseña</Text>

          {/* Description */}
          <Text style={styles.description}>
            Ingresa tu correo electrónico y te enviaremos instrucciones para
            restablecer tu contraseña.
          </Text>

          {/* Input */}
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Back button */}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Regresar</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
  },
  title: {
    fontSize: SIZES.h1,
    ...FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.md,
  },
  description: {
    fontSize: SIZES.body,
    ...FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SIZES.xl,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radiusMd,
    height: SIZES.inputHeight,
    paddingHorizontal: SIZES.md,
    fontSize: SIZES.body,
    ...FONTS.regular,
    color: COLORS.textDark,
    marginBottom: SIZES.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radiusFull,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: SIZES.h4,
    ...FONTS.semiBold,
  },
});

export default ForgotPasswordScreen;
