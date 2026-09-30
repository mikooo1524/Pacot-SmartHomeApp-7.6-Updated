import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../context/IoTContext';

type Props = {
  message: string;
  onDismiss?: () => void;
};

export default function SuccessBanner({ message, onDismiss }: Props) {
  const { theme } = useIoT();

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.successLight,
          borderColor: theme.success,
          borderWidth: 1,
        },
      ]}
    >
      <Ionicons name="checkmark-circle" size={22} color={theme.success} />
      <Text style={[styles.message, { color: theme.success }]}>
        {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Ionicons name="close" size={18} color={theme.success} />
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
    fontWeight: '600',
    lineHeight: 18,
  },
  dismissButton: {
    padding: 4,
  },
});
