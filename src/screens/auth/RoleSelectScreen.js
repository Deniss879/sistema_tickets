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

const RoleSelectScreen = ({ navigation }) => {
  const handleRoleSelect = (role) => {
    navigation.navigate('Login', { role });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Wave decorations with adjusted opacity */}
      <WaveTop style={{ opacity: 0.3 }} />
      <WaveBottom style={{ opacity: 0.3 }} />

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

        {/* Role buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.roleButton}
            activeOpacity={0.8}
            onPress={() => handleRoleSelect('admin')}
          >
            <Text style={styles.roleButtonText}>ADMINISTRADOR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleButton}
            activeOpacity={0.8}
            onPress={() => handleRoleSelect('usuario')}
          >
            <Text style={styles.roleButtonText}>USUARIO</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: COLORS.textWhite,
    letterSpacing: 3,
  },
  titleSub: {
    fontSize: SIZES.body,
    ...FONTS.medium,
    color: COLORS.textWhite,
    letterSpacing: 1.5,
    marginTop: SIZES.xs,
    opacity: 0.85,
  },
  buttonSection: {
    width: '100%',
    paddingHorizontal: SIZES.xxl,
    paddingBottom: SIZES.xxl,
    gap: SIZES.md,
  },
  roleButton: {
    borderWidth: 2,
    borderColor: COLORS.textWhite,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusFull,
    alignItems: 'center',
  },
  roleButtonText: {
    color: COLORS.textWhite,
    fontSize: SIZES.h4,
    ...FONTS.semiBold,
    letterSpacing: 2,
  },
});

export default RoleSelectScreen;
