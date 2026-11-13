import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../theme';
import { WaveTop, WaveBottom } from '../../components/decorations/Waves';

const AccountCreatedScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Wave decorations */}
      <WaveTop />
      <WaveBottom />

      {/* Content */}
      <View style={styles.content}>
        {/* Checkmark icon */}
        <View style={styles.checkCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Cuenta creada</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Cualquier dato que quieras informar un usuario
        </Text>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  checkIcon: {
    fontSize: 48,
    color: COLORS.textWhite,
    ...FONTS.bold,
  },
  title: {
    fontSize: SIZES.h1,
    ...FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.md,
  },
  subtitle: {
    fontSize: SIZES.body,
    ...FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.xxl,
    paddingHorizontal: SIZES.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radiusFull,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xxl * 2,
    minWidth: 200,
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: SIZES.h4,
    ...FONTS.semiBold,
  },
});

export default AccountCreatedScreen;
