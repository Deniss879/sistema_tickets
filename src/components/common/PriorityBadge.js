import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../theme';

const PRIORITY_CONFIG = {
  alta: {
    backgroundColor: COLORS.priorityHigh,
    label: 'Alta',
  },
  normal: {
    backgroundColor: COLORS.priorityNormal,
    label: 'Normal',
  },
};

const PriorityBadge = ({ priority = 'normal' }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={styles.text}>{config.label}</Text>
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
  text: {
    color: COLORS.textWhite,
    fontSize: SIZES.small,
    ...FONTS.semiBold,
  },
});

export default PriorityBadge;
