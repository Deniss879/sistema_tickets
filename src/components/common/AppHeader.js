import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../theme';

const STATUS_BAR_HEIGHT =
  Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

const AppHeader = ({
  title,
  onMenuPress,
  onNotificationPress,
  onHomePress,
  notificationCount = 0,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left — Hamburger menu */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <Text style={styles.iconText}>☰</Text>
        </TouchableOpacity>

        {/* Center — Title */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* Right — Notification bell + Home */}
        <View style={styles.rightIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onNotificationPress}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>🔔</Text>
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onHomePress}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>🏠</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingTop: STATUS_BAR_HEIGHT,
    ...SHADOWS.small,
  },
  content: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconText: {
    fontSize: 22,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: SIZES.h4,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    marginHorizontal: SIZES.sm,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.danger,
    borderRadius: SIZES.radiusFull,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.textWhite,
    fontSize: 10,
    ...FONTS.bold,
  },
});

export default AppHeader;
