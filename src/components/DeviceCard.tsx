import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Device } from '../models/IoTModels';
import { useIoT } from '../context/IoTContext';

type Props = {
  device: Device;
  onEdit?: (device: Device) => void;
  onDelete?: (device: Device) => void;
};

export default function DeviceCard({ device, onEdit, onDelete }: Props) {
  const {
    theme,
    gatewayConnected,
    updatingDeviceIds,
    toggleDevice,
    toggleFavorite,
    setDeviceBrightness,
    setDeviceSpeed,
    setDeviceTargetTemp,
  } = useIoT();

  const [expanded, setExpanded] = useState(false);
  const updating = updatingDeviceIds.includes(device.id);
  const isOnline = gatewayConnected;

  // Determine icon tint color
  const getIconColor = () => {
    if (!isOnline) return theme.textMuted;
    if (!device.status) return theme.textMuted;
    if (device.type === 'Smart Light') return '#F59E0B';
    if (device.type === 'Smart Fan') return '#3B82F6';
    if (device.type === 'Smart Lock') return '#10B981';
    if (device.type === 'Thermostat') return '#EF4444';
    if (device.type === 'Smart Plug') return '#8B5CF6';
    return theme.primary;
  };

  const hasSubControls =
    device.status &&
    (device.type === 'Smart Light' ||
      device.type === 'Smart Fan' ||
      device.type === 'Thermostat');

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: device.status ? theme.primaryLight : theme.border,
          shadowColor: theme.cardShadow,
        },
        !isOnline && styles.cardDisabled,
      ]}
    >
      {/* Main Row */}
      <View style={styles.mainRow}>
        {/* Device Icon */}
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: device.status
                ? `${getIconColor()}1A`
                : theme.surfaceSubdued,
            },
          ]}
        >
          {updating ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Ionicons
              name={device.icon}
              size={26}
              color={getIconColor()}
            />
          )}
        </View>

        {/* Device Info */}
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.deviceName,
                { color: theme.textPrimary },
              ]}
              numberOfLines={1}
            >
              {device.name}
            </Text>

            <TouchableOpacity
              onPress={() => toggleFavorite(device.id)}
              style={styles.favButton}
            >
              <Ionicons
                name={device.isFavorite ? 'star' : 'star-outline'}
                size={16}
                color={device.isFavorite ? '#F59E0B' : theme.textMuted}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.deviceType, { color: theme.textSecondary }]}>
              {device.type}
            </Text>

            {device.room && (
              <View
                style={[
                  styles.roomBadge,
                  { backgroundColor: theme.surfaceSubdued },
                ]}
              >
                <Text style={[styles.roomText, { color: theme.textMuted }]}>
                  {device.room}
                </Text>
              </View>
            )}

            {device.powerUsage && device.status && (
              <Text style={[styles.powerText, { color: theme.textMuted }]}>
                • {device.powerUsage}W
              </Text>
            )}

            {device.batteryLevel !== undefined && (
              <View style={styles.batteryRow}>
                <Ionicons
                  name={
                    device.batteryLevel > 20
                      ? 'battery-charging'
                      : 'battery-dead'
                  }
                  size={12}
                  color={device.batteryLevel > 20 ? theme.success : theme.danger}
                />
                <Text style={[styles.batteryText, { color: theme.textMuted }]}>
                  {device.batteryLevel}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Power Switch */}
        <View style={styles.switchCol}>
          <Switch
            value={device.status}
            disabled={!isOnline || updating}
            trackColor={{
              false: theme.switchTrackInactive,
              true: theme.primary,
            }}
            thumbColor={'#FFFFFF'}
            onValueChange={(val) => toggleDevice(device.id, val)}
          />
        </View>
      </View>

      {/* Interactive Sub-Controls (Brightness / Speed / Temperature) */}
      {hasSubControls && (
        <View
          style={[
            styles.subControlsArea,
            {
              backgroundColor: theme.surfaceSubdued,
              borderTopColor: theme.border,
            },
          ]}
        >
          {/* Smart Light Brightness Control */}
          {device.type === 'Smart Light' && (
            <View style={styles.controlRow}>
              <View style={styles.controlLabelRow}>
                <Ionicons name="sunny-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.controlLabel, { color: theme.textSecondary }]}>
                  Brightness: {device.brightness || 80}%
                </Text>
              </View>
              <View style={styles.quickPills}>
                {[25, 50, 75, 100].map((level) => {
                  const isActive = (device.brightness || 80) === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setDeviceBrightness(device.id, level)}
                      style={[
                        styles.quickPill,
                        {
                          backgroundColor: isActive
                            ? theme.primary
                            : theme.surface,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickPillText,
                          { color: isActive ? '#FFFFFF' : theme.textPrimary },
                        ]}
                      >
                        {level}%
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Smart Fan Speed Control */}
          {device.type === 'Smart Fan' && (
            <View style={styles.controlRow}>
              <View style={styles.controlLabelRow}>
                <Ionicons name="speedometer-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.controlLabel, { color: theme.textSecondary }]}>
                  Fan Speed
                </Text>
              </View>
              <View style={styles.quickPills}>
                {[1, 2, 3, 4, 5].map((spd) => {
                  const isActive = (device.speed || 1) === spd;
                  return (
                    <TouchableOpacity
                      key={spd}
                      onPress={() => setDeviceSpeed(device.id, spd)}
                      style={[
                        styles.quickPill,
                        {
                          backgroundColor: isActive
                            ? theme.primary
                            : theme.surface,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickPillText,
                          { color: isActive ? '#FFFFFF' : theme.textPrimary },
                        ]}
                      >
                        {spd}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Thermostat Temperature Stepper */}
          {device.type === 'Thermostat' && (
            <View style={styles.controlRow}>
              <View style={styles.controlLabelRow}>
                <Ionicons name="thermometer-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.controlLabel, { color: theme.textSecondary }]}>
                  Target: {device.targetTemperature || 23}°C
                </Text>
              </View>
              <View style={styles.stepperGroup}>
                <TouchableOpacity
                  onPress={() =>
                    setDeviceTargetTemp(
                      device.id,
                      Math.max((device.targetTemperature || 23) - 1, 16)
                    )
                  }
                  style={[styles.stepperBtn, { backgroundColor: theme.surface }]}
                >
                  <Ionicons name="remove" size={16} color={theme.textPrimary} />
                </TouchableOpacity>

                <Text style={[styles.stepperVal, { color: theme.textPrimary }]}>
                  {device.targetTemperature || 23}°C
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setDeviceTargetTemp(
                      device.id,
                      Math.min((device.targetTemperature || 23) + 1, 30)
                    )
                  }
                  style={[styles.stepperBtn, { backgroundColor: theme.surface }]}
                >
                  <Ionicons name="add" size={16} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Action Footer (Edit / Delete buttons) */}
      <View style={styles.footerRow}>
        <Text style={[styles.lastUpdatedText, { color: theme.textMuted }]}>
          Updated {device.lastUpdated || 'recently'}
        </Text>

        <View style={styles.actionButtons}>
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(device)}
              style={[styles.actionBtn, { backgroundColor: theme.surfaceSubdued }]}
            >
              <Ionicons name="create-outline" size={15} color={theme.textSecondary} />
              <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(device)}
              style={[styles.actionBtn, { backgroundColor: theme.dangerLight }]}
            >
              <Ionicons name="trash-outline" size={15} color={theme.danger} />
              <Text style={[styles.actionBtnText, { color: theme.danger }]}>
                Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardDisabled: {
    opacity: 0.6,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  favButton: {
    padding: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  deviceType: {
    fontSize: 12,
    fontWeight: '500',
  },
  roomBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roomText: {
    fontSize: 11,
    fontWeight: '600',
  },
  powerText: {
    fontSize: 11,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  batteryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  switchCol: {
    marginLeft: 10,
  },
  subControlsArea: {
    padding: 12,
    borderTopWidth: 1,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickPills: {
    flexDirection: 'row',
    gap: 6,
  },
  quickPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  quickPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperVal: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 44,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  lastUpdatedText: {
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
