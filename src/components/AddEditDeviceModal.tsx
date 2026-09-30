import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Device,
  ROOM_OPTIONS,
  DEVICE_TYPE_OPTIONS,
  DeviceType,
} from '../models/IoTModels';
import { useIoT } from '../context/IoTContext';

type Props = {
  visible: boolean;
  deviceToEdit?: Device | null;
  onClose: () => void;
  onSave: (deviceData: Omit<Device, 'id'>) => Promise<void>;
};

export default function AddEditDeviceModal({
  visible,
  deviceToEdit,
  onClose,
  onSave,
}: Props) {
  const { theme } = useIoT();

  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<DeviceType>('Smart Light');
  const [selectedRoom, setSelectedRoom] = useState('Living Room');
  const [icon, setIcon] = useState<keyof typeof Ionicons.glyphMap>('bulb-outline');
  const [status, setStatus] = useState(true);
  const [powerUsage, setPowerUsage] = useState('15');
  const [isFavorite, setIsFavorite] = useState(false);

  const [nameError, setNameError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (deviceToEdit) {
      setName(deviceToEdit.name);
      setSelectedType((deviceToEdit.type as DeviceType) || 'Smart Light');
      setSelectedRoom(deviceToEdit.room || 'Living Room');
      setIcon(deviceToEdit.icon || 'bulb-outline');
      setStatus(deviceToEdit.status);
      setPowerUsage(deviceToEdit.powerUsage ? String(deviceToEdit.powerUsage) : '0');
      setIsFavorite(deviceToEdit.isFavorite || false);
    } else {
      setName('');
      setSelectedType('Smart Light');
      setSelectedRoom('Living Room');
      setIcon('bulb-outline');
      setStatus(true);
      setPowerUsage('15');
      setIsFavorite(false);
    }
    setNameError('');
    setSubmitting(false);
  }, [deviceToEdit, visible]);

  const handleTypeChange = (type: DeviceType) => {
    setSelectedType(type);
    const option = DEVICE_TYPE_OPTIONS.find((o) => o.type === type);
    if (option) {
      setIcon(option.defaultIcon);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError('Please enter a device name.');
      return;
    }

    setSubmitting(true);
    setNameError('');

    try {
      const parsedPower = parseInt(powerUsage, 10) || 0;
      await onSave({
        name: name.trim(),
        type: selectedType,
        room: selectedRoom,
        icon,
        status,
        powerUsage: parsedPower,
        isFavorite,
        brightness: selectedType === 'Smart Light' ? 80 : undefined,
        speed: selectedType === 'Smart Fan' ? 2 : undefined,
        targetTemperature: selectedType === 'Thermostat' ? 23 : undefined,
      });
      onClose();
    } catch (err: any) {
      setNameError(err.message || 'Failed to save device.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = !!deviceToEdit;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: theme.cardShadow,
            },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons
                name={isEdit ? 'create-outline' : 'add-circle-outline'}
                size={24}
                color={theme.primary}
              />
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {isEdit ? 'Edit Device' : 'Add New Device'}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Device Name Field */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Device Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSubdued,
                    color: theme.textPrimary,
                    borderColor: nameError ? theme.danger : theme.border,
                  },
                ]}
                placeholder="e.g. Living Room Chandelier"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError('');
                }}
              />
              {!!nameError && (
                <Text style={[styles.errorText, { color: theme.danger }]}>
                  {nameError}
                </Text>
              )}
            </View>

            {/* Device Type Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Device Type
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.pillRow}>
                  {DEVICE_TYPE_OPTIONS.map((opt) => {
                    const isSelected = selectedType === opt.type;
                    return (
                      <TouchableOpacity
                        key={opt.type}
                        onPress={() => handleTypeChange(opt.type)}
                        style={[
                          styles.typePill,
                          {
                            backgroundColor: isSelected
                              ? theme.primary
                              : theme.surfaceSubdued,
                            borderColor: isSelected
                              ? theme.primary
                              : theme.border,
                          },
                        ]}
                      >
                        <Ionicons
                          name={opt.defaultIcon}
                          size={16}
                          color={isSelected ? '#FFFFFF' : theme.textSecondary}
                        />
                        <Text
                          style={[
                            styles.typePillText,
                            {
                              color: isSelected
                                ? '#FFFFFF'
                                : theme.textSecondary,
                            },
                          ]}
                        >
                          {opt.type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Room Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Room Location
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.pillRow}>
                  {ROOM_OPTIONS.filter((r) => r !== 'All').map((room) => {
                    const isSelected = selectedRoom === room;
                    return (
                      <TouchableOpacity
                        key={room}
                        onPress={() => setSelectedRoom(room)}
                        style={[
                          styles.typePill,
                          {
                            backgroundColor: isSelected
                              ? theme.primary
                              : theme.surfaceSubdued,
                            borderColor: isSelected
                              ? theme.primary
                              : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typePillText,
                            {
                              color: isSelected
                                ? '#FFFFFF'
                                : theme.textSecondary,
                            },
                          ]}
                        >
                          {room}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Power Usage & Status */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Power Usage (Watts)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surfaceSubdued,
                      color: theme.textPrimary,
                      borderColor: theme.border,
                    },
                  ]}
                  keyboardType="numeric"
                  placeholder="e.g. 20"
                  placeholderTextColor={theme.textMuted}
                  value={powerUsage}
                  onChangeText={setPowerUsage}
                />
              </View>

              <View style={[styles.formGroup, { marginLeft: 16 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Initial Power
                </Text>
                <View style={styles.switchWrapper}>
                  <Switch
                    value={status}
                    trackColor={{
                      false: theme.switchTrackInactive,
                      true: theme.primary,
                    }}
                    thumbColor={'#FFFFFF'}
                    onValueChange={setStatus}
                  />
                  <Text style={[styles.switchStatus, { color: theme.textPrimary }]}>
                    {status ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Mark as Favorite */}
            <View
              style={[
                styles.favoriteRow,
                {
                  backgroundColor: theme.surfaceSubdued,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.favTextCol}>
                <Text style={[styles.favTitle, { color: theme.textPrimary }]}>
                  Pin to Favorites
                </Text>
                <Text style={[styles.favSub, { color: theme.textMuted }]}>
                  Quick access on dashboard
                </Text>
              </View>
              <Switch
                value={isFavorite}
                trackColor={{
                  false: theme.switchTrackInactive,
                  true: theme.primary,
                }}
                thumbColor={'#FFFFFF'}
                onValueChange={setIsFavorite}
              />
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={onClose}
              disabled={submitting}
              style={[
                styles.cancelBtn,
                { backgroundColor: theme.surfaceSubdued },
              ]}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              style={[
                styles.saveBtn,
                { backgroundColor: theme.primary },
                submitting && styles.btnDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>
                    {isEdit ? 'Update Device' : 'Add Device'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    gap: 8,
  },
  switchStatus: {
    fontSize: 13,
    fontWeight: '700',
  },
  favoriteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  favTextCol: {
    flex: 1,
  },
  favTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  favSub: {
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
