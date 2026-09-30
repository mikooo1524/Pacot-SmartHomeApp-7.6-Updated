import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../context/IoTContext';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon = 'cube-outline',
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  const { theme } = useIoT();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.surfaceSubdued },
        ]}
      >
        <Ionicons name={icon} size={36} color={theme.textMuted} />
      </View>

      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {title}
      </Text>

      <Text style={[styles.description, { color: theme.textSecondary }]}>
        {description}
      </Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.button, { backgroundColor: theme.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
