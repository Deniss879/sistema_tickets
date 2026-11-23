import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../theme';

const STATUS_CONFIG = {
  abierto: {
    backgroundColor: COLORS.statusOpen,
    label: 'Nuevo',
  },
  en_proceso: {
    backgroundColor: COLORS.statusInProgress,
    label: 'En Proceso',
  },
  finalizado: {
    backgroundColor: COLORS.statusDone,
    label: 'Finalizado',
  },
  cerrado: {
    backgroundColor: COLORS.statusDone,
    label: 'Cerrado',
  },
};

const StatusBadge = ({ status = 'abierto', small = false }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.abierto;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.backgroundColor },
        small && styles.badgeSmall,
      ]}
    >
      <Text style={[styles.text, small && styles.textSmall]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SIZES.sm + 4,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
  },
  text: {
    color: COLORS.textWhite,
    fontSize: SIZES.small,
    ...FONTS.semiBold,
  },
  textSmall: {
    fontSize: 10,
  },
});

export default StatusBadge;
