import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../context/IoTContext';

type Props = {
  message: string;
  onRetry?: () => void;
  retryDisabled?: boolean;
  onDismiss?: () => void;
};

export default function ErrorBanner({
  message,
  onRetry,
  retryDisabled,
  onDismiss,
}: Props) {
  const { theme } = useIoT();

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.dangerLight,
          borderColor: theme.danger,
          borderWidth: 1,
        },
      ]}
    >
      <Ionicons name="alert-circle" size={22} color={theme.danger} />

      <Text style={[styles.message, { color: theme.danger }]}>
        {message}
      </Text>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          disabled={retryDisabled}
          style={[
            styles.retryButton,
            { backgroundColor: theme.danger },
            retryDisabled && styles.retryDisabled,
          ]}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}

      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Ionicons name="close" size={18} color={theme.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  retryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  retryDisabled: {
    opacity: 0.5,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dismissButton: {
    padding: 4,
  },
});
