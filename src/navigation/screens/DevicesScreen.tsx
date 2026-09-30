import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../../context/IoTContext';
import ErrorBanner from '../../components/ErrorBanner';
import SuccessBanner from '../../components/SuccessBanner';
import DeviceCard from '../../components/DeviceCard';
import FilterChips from '../../components/FilterChips';
import EmptyState from '../../components/EmptyState';
import AddEditDeviceModal from '../../components/AddEditDeviceModal';
import { Device, ROOM_OPTIONS } from '../../models/IoTModels';

export default function DevicesScreen() {
  const {
    devices,
    devicesLoading,
    devicesError,
    deviceError,
    gatewayConnected,
    gatewayConnecting,
    theme,
    loadDevices,
    retryDeviceUpdate,
    connectGateway,
    addDevice,
    updateDevice,
    deleteDevice,
    turnAllDevices,
  } = useIoT();

  const [selectedRoom, setSelectedRoom] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'ON' | 'OFF'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtered devices list
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      // Room filter
      if (selectedRoom !== 'All' && device.room !== selectedRoom) {
        return false;
      }
      // Status filter
      if (statusFilter === 'ON' && !device.status) {
        return false;
      }
      if (statusFilter === 'OFF' && device.status) {
        return false;
      }
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = device.name.toLowerCase().includes(query);
        const matchesType = device.type.toLowerCase().includes(query);
        const matchesRoom = (device.room || '').toLowerCase().includes(query);
        return matchesName || matchesType || matchesRoom;
      }
      return true;
    });
  }, [devices, selectedRoom, statusFilter, searchQuery]);

  const handleSaveDevice = async (deviceData: Omit<Device, 'id'>) => {
    if (editingDevice) {
      await updateDevice(editingDevice.id, deviceData);
      setSuccessMessage(`Updated "${deviceData.name}"`);
    } else {
      await addDevice(deviceData);
      setSuccessMessage(`Added "${deviceData.name}"`);
    }
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteDevice = (device: Device) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Are you sure you want to remove "${device.name}"?`
      );
      if (confirmed) {
        deleteDevice(device.id);
        setSuccessMessage(`Removed "${device.name}"`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } else {
      Alert.alert(
        'Delete Device',
        `Are you sure you want to delete ${device.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteDevice(device.id);
              setSuccessMessage(`Removed "${device.name}"`);
              setTimeout(() => setSuccessMessage(null), 4000);
            },
          },
        ]
      );
    }
  };

  const activeCount = devices.filter((d) => d.status).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Devices
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {devices.length} registered hardware • {activeCount} currently active
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setEditingDevice(null);
            setModalVisible(true);
          }}
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Device</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications / Errors */}
      {successMessage && (
        <SuccessBanner
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {!gatewayConnected && (
        <ErrorBanner
          message="IoT Gateway is disconnected. Device controls are disabled."
          onRetry={connectGateway}
          retryDisabled={gatewayConnecting}
        />
      )}

      {devicesError && gatewayConnected && (
        <ErrorBanner
          message={devicesError}
          onRetry={loadDevices}
          retryDisabled={devicesLoading}
        />
      )}

      {deviceError && gatewayConnected && (
        <ErrorBanner
          message={deviceError.message}
          onRetry={retryDeviceUpdate}
        />
      )}

      {/* Search Bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Ionicons name="search-outline" size={20} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search devices by name, type, or room..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {!!searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Room Filter Chips */}
      <FilterChips
        options={ROOM_OPTIONS}
        selectedOption={selectedRoom}
        onSelect={setSelectedRoom}
      />

      {/* Status Filter & Batch Controls */}
      <View style={styles.controlsRow}>
        {/* Status Pills */}
        <View
          style={[
            styles.statusTabs,
            { backgroundColor: theme.surfaceSubdued },
          ]}
        >
          {(['All', 'ON', 'OFF'] as const).map((st) => {
            const isSelected = statusFilter === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => setStatusFilter(st)}
                style={[
                  styles.statusTab,
                  isSelected && {
                    backgroundColor: theme.surface,
                    shadowColor: theme.cardShadow,
                    elevation: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusTabText,
                    {
                      color: isSelected
                        ? theme.textPrimary
                        : theme.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Batch Toggle Buttons */}
        <View style={styles.batchButtons}>
          <TouchableOpacity
            onPress={() => turnAllDevices(true)}
            disabled={!gatewayConnected}
            style={[
              styles.batchBtn,
              { backgroundColor: theme.surfaceSubdued },
              !gatewayConnected && styles.btnDisabled,
            ]}
          >
            <Ionicons name="power" size={14} color={theme.success} />
            <Text style={[styles.batchBtnText, { color: theme.textSecondary }]}>
              All ON
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => turnAllDevices(false)}
            disabled={!gatewayConnected}
            style={[
              styles.batchBtn,
              { backgroundColor: theme.surfaceSubdued },
              !gatewayConnected && styles.btnDisabled,
            ]}
          >
            <Ionicons name="power" size={14} color={theme.danger} />
            <Text style={[styles.batchBtnText, { color: theme.textSecondary }]}>
              All OFF
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Device List */}
      {devicesLoading && devices.length === 0 ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading connected devices...
          </Text>
        </View>
      ) : filteredDevices.length === 0 ? (
        <EmptyState
          icon="hardware-chip-outline"
          title="No Devices Found"
          description={
            searchQuery || selectedRoom !== 'All' || statusFilter !== 'All'
              ? 'No devices match your current filters. Try changing or clearing your search criteria.'
              : 'You have not added any smart devices yet. Add your first device to get started.'
          }
          actionLabel={
            searchQuery || selectedRoom !== 'All' || statusFilter !== 'All'
              ? 'Clear Filters'
              : 'Add First Device'
          }
          onAction={() => {
            if (
              searchQuery ||
              selectedRoom !== 'All' ||
              statusFilter !== 'All'
            ) {
              setSearchQuery('');
              setSelectedRoom('All');
              setStatusFilter('All');
            } else {
              setEditingDevice(null);
              setModalVisible(true);
            }
          }}
        />
      ) : (
        <View style={styles.deviceList}>
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onEdit={(dev) => {
                setEditingDevice(dev);
                setModalVisible(true);
              }}
              onDelete={handleDeleteDevice}
            />
          ))}
        </View>
      )}

      {/* Add / Edit Device Form Modal */}
      <AddEditDeviceModal
        visible={modalVisible}
        deviceToEdit={editingDevice}
        onClose={() => {
          setModalVisible(false);
          setEditingDevice(null);
        }}
        onSave={handleSaveDevice}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  statusTabs: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  statusTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTabText: {
    fontSize: 12,
  },
  batchButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  batchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  batchBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  loadingWrapper: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  deviceList: {
    marginTop: 6,
  },
});