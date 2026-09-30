import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../context/IoTContext';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'danger';
};

export default function StatWidget({
  title,
  value,
  subtitle,
  icon,
  color,
  badgeText,
  badgeType = 'info',
}: Props) {
  const { theme } = useIoT();
  const iconColor = color || theme.primary;

  const badgeColors = {
    success: { bg: theme.successLight, text: theme.success },
    warning: { bg: theme.warningLight, text: theme.warning },
    danger: { bg: theme.dangerLight, text: theme.danger },
    info: { bg: theme.infoLight, text: theme.info },
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.cardShadow,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: `${iconColor}1A` },
          ]}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>

        {badgeText && (
          <View
            style={[
              styles.badge,
              { backgroundColor: badgeColors[badgeType].bg },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: badgeColors[badgeType].text },
              ]}
            >
              {badgeText}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: theme.textSecondary }]}>
        {title}
      </Text>

      <Text style={[styles.value, { color: theme.textPrimary }]}>
        {value}
      </Text>

      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 140,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 3,
  },
});
