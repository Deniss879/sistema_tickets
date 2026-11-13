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

const SplashScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Wave decorations */}
      <WaveTop />
      <WaveBottom />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo area */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🖥️🔧</Text>
          </View>
          <Text style={styles.titleMain}>SISTEMAS</Text>
          <Text style={styles.titleSub}>TEZONTEPEC DE ALDAMA</Text>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <Text style={styles.welcomeText}>BIENVENIDO</Text>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('RoleSelect')}
          >
            <Text style={styles.buttonText}>Iniciar</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  logoEmoji: {
    fontSize: 48,
  },
  titleMain: {
    fontSize: 32,
    ...FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 3,
  },
  titleSub: {
    fontSize: SIZES.body,
    ...FONTS.medium,
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginTop: SIZES.xs,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: SIZES.xl,
    width: '100%',
    paddingHorizontal: SIZES.xxl,
  },
  welcomeText: {
    fontSize: SIZES.h1,
    ...FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 4,
    marginBottom: SIZES.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xxl * 2,
    borderRadius: SIZES.radiusFull,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: SIZES.h4,
    ...FONTS.semiBold,
  },
});

export default SplashScreen;
