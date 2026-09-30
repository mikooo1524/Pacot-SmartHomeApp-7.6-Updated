import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AutomationScene } from '../models/IoTModels';
import { useIoT } from '../context/IoTContext';

type Props = {
  scene: AutomationScene;
  onTrigger: (scene: AutomationScene) => Promise<void>;
};

export default function QuickSceneCard({ scene, onTrigger }: Props) {
  const { theme, gatewayConnected } = useIoT();
  const [running, setRunning] = useState(false);

  const handlePress = async () => {
    if (!gatewayConnected || running) return;
    setRunning(true);
    try {
      await onTrigger(scene);
    } finally {
      setRunning(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!gatewayConnected || running}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: scene.isActive ? theme.primaryLight : theme.surface,
          borderColor: scene.isActive ? theme.primary : theme.border,
          shadowColor: theme.cardShadow,
        },
        !gatewayConnected && styles.disabledCard,
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: scene.isActive
                ? theme.primary
                : theme.surfaceSubdued,
            },
          ]}
        >
          {running ? (
            <ActivityIndicator
              size="small"
              color={scene.isActive ? '#FFFFFF' : theme.primary}
            />
          ) : (
            <Ionicons
              name={scene.icon}
              size={20}
              color={scene.isActive ? '#FFFFFF' : theme.textPrimary}
            />
          )}
        </View>

        {scene.isActive && (
          <View
            style={[styles.activePill, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.activePillText}>Active</Text>
          </View>
        )}
      </View>

      <Text
        style={[styles.name, { color: theme.textPrimary }]}
        numberOfLines={1}
      >
        {scene.name}
      </Text>

      <Text
        style={[styles.description, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {scene.description}
      </Text>

      <View style={styles.footerRow}>
        <Ionicons name="flash-outline" size={12} color={theme.textMuted} />
        <Text style={[styles.actionSummary, { color: theme.textMuted }]}>
          {scene.actionSummary}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 175,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
  },
  disabledCard: {
    opacity: 0.6,
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
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionSummary: {
    fontSize: 10,
    fontWeight: '500',
  },
});
