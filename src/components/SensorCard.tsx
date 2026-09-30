import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../context/IoTContext';

type Props = {
  title: string;
  value: string | number;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  description?: string;
  statusText?: string;
  statusType?: 'success' | 'warning' | 'info' | 'danger';
  iconColor?: string;
};

export default function SensorCard({
  title,
  value,
  unit,
  icon,
  description,
  statusText,
  statusType = 'info',
  iconColor,
}: Props) {
  const { theme } = useIoT();
  const activeIconColor = iconColor || theme.primary;

  const statusColors = {
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
      <View style={styles.header}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: `${activeIconColor}1A` },
          ]}
        >
          <Ionicons name={icon} size={22} color={activeIconColor} />
        </View>

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.textSecondary }]}>
            {title}
          </Text>
        </View>

        {statusText && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[statusType].bg },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusColors[statusType].text },
              ]}
            >
              {statusText}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: theme.textPrimary }]}>
          {value}
        </Text>
        {unit && (
          <Text style={[styles.unit, { color: theme.textMuted }]}>
            {unit}
          </Text>
        )}
      </View>

      {description && (
        <Text style={[styles.description, { color: theme.textMuted }]}>
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    marginTop: 6,
  },
});
