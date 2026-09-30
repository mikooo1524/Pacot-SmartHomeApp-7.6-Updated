import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../../context/IoTContext';
import ErrorBanner from '../../components/ErrorBanner';
import SuccessBanner from '../../components/SuccessBanner';
import StatWidget from '../../components/StatWidget';
import SensorCard from '../../components/SensorCard';
import DeviceCard from '../../components/DeviceCard';
import QuickSceneCard from '../../components/QuickSceneCard';
import AddEditDeviceModal from '../../components/AddEditDeviceModal';
import { Device, AutomationScene } from '../../models/IoTModels';

export default function DashboardScreen({ navigation }: any) {
  const {
    devices,
    sensors,
    scenes,
    activityLogs,
    gatewayConnected,
    gatewayConnecting,
    devicesLoading,
    sensorsLoading,
    devicesError,
    sensorsError,
    deviceError,
    theme,
    activeDeviceCount,
    totalPowerUsage,
    appSettings,
    toggleDevice,
    retryDeviceUpdate,
    loadDevices,
    refreshSensors,
    connectGateway,
    triggerScene,
    refreshAll,
    addDevice,
    updateDevice,
    deleteDevice,
  } = useIoT();

  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const handleTriggerScene = async (scene: AutomationScene) => {
    try {
      const msg = await triggerScene(scene.id);
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      // Handled via context errors
    }
  };

  const handleSaveDevice = async (deviceData: Omit<Device, 'id'>) => {
    if (editingDevice) {
      await updateDevice(editingDevice.id, deviceData);
      setSuccessMessage(`Updated ${deviceData.name}`);
    } else {
      await addDevice(deviceData);
      setSuccessMessage(`Added ${deviceData.name} to smart home`);
    }
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Filter favorite or active devices for quick dashboard access
  const favoriteDevices = devices.filter((d) => d.isFavorite || d.status);
  const displayDevices = favoriteDevices.length > 0 ? favoriteDevices : devices.slice(0, 3);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      {/* Header Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {appSettings.homeName || 'IoT Dashboard'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setEditingDevice(null);
            setModalVisible(true);
          }}
          style={[styles.quickAddBtn, { backgroundColor: theme.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.quickAddBtnText}>Add Device</Text>
        </TouchableOpacity>
      </View>

      {/* Status Notifications / Banners */}
      {successMessage && (
        <SuccessBanner
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {!gatewayConnected && (
        <ErrorBanner
          message="IoT Gateway is disconnected. Device controls & live sensors are offline."
          onRetry={() => connectGateway()}
          retryDisabled={gatewayConnecting}
        />
      )}

      {sensorsError && gatewayConnected && (
        <ErrorBanner
          message={sensorsError}
          onRetry={refreshSensors}
          retryDisabled={sensorsLoading}
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

      {/* Quick Stats Summary */}
      <View style={styles.statsRow}>
        <StatWidget
          title="Active Devices"
          value={`${activeDeviceCount} / ${devices.length}`}
          subtitle={`${devices.length - activeDeviceCount} idle`}
          icon="hardware-chip-outline"
          color={theme.primary}
          badgeText={activeDeviceCount > 0 ? 'Active' : 'All Off'}
          badgeType={activeDeviceCount > 0 ? 'success' : 'info'}
        />

        <StatWidget
          title="Total Power"
          value={`${totalPowerUsage} W`}
          subtitle="Real-time draw"
          icon="flash-outline"
          color="#F59E0B"
          badgeText={`${(totalPowerUsage / 1000).toFixed(2)} kW`}
          badgeType="warning"
        />

        <StatWidget
          title="Gateway Hub"
          value={gatewayConnected ? 'Online' : 'Offline'}
          subtitle={gatewayConnected ? '24ms latency' : 'No connection'}
          icon={gatewayConnected ? 'cloud-done-outline' : 'cloud-offline-outline'}
          color={gatewayConnected ? theme.success : theme.danger}
          badgeText={gatewayConnected ? 'Connected' : 'Offline'}
          badgeType={gatewayConnected ? 'success' : 'danger'}
        />
      </View>

      {/* Quick Automation Scenes */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Quick Scenes
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          One-tap automations
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scenesContainer}
      >
        {scenes.map((scene) => (
          <QuickSceneCard
            key={scene.id}
            scene={scene}
            onTrigger={handleTriggerScene}
          />
        ))}
      </ScrollView>

      {/* Environment Sensors Overview */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleGroup}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Environment Telemetry
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Live room telemetry
          </Text>
        </View>

        <TouchableOpacity
          onPress={refreshSensors}
          disabled={sensorsLoading || !gatewayConnected}
          style={[styles.refreshBtn, { backgroundColor: theme.surfaceSubdued }]}
        >
          {sensorsLoading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Ionicons name="refresh" size={16} color={theme.textPrimary} />
          )}
          <Text style={[styles.refreshBtnText, { color: theme.textPrimary }]}>
            {sensorsLoading ? 'Updating' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sensorGrid}>
        <View style={styles.sensorGridCol}>
          <SensorCard
            title="Temperature"
            value={sensors.temperature}
            unit="°C"
            icon="thermometer-outline"
            iconColor="#EF4444"
            description="Optimal comfort range: 21-26°C"
            statusText={
              sensors.temperature > 30
                ? 'High'
                : sensors.temperature < 20
                ? 'Cool'
                : 'Optimal'
            }
            statusType={
              sensors.temperature > 30
                ? 'warning'
                : sensors.temperature < 20
                ? 'info'
                : 'success'
            }
          />

          <SensorCard
            title="Ambient Light"
            value={sensors.lightLevel}
            unit="lux"
            icon="sunny-outline"
            iconColor="#F59E0B"
            description="Natural daytime brightness"
            statusText={sensors.lightLevel > 600 ? 'Bright' : 'Dim'}
            statusType="info"
          />
        </View>

        <View style={styles.sensorGridCol}>
          <SensorCard
            title="Humidity"
            value={sensors.humidity}
            unit="%"
            icon="water-outline"
            iconColor="#3B82F6"
            description="Target humidity: 40-60%"
            statusText={
              sensors.humidity > 70
                ? 'High'
                : sensors.humidity < 40
                ? 'Dry'
                : 'Normal'
            }
            statusType={sensors.humidity > 70 ? 'warning' : 'success'}
          />

          <SensorCard
            title="Air Quality"
            value={sensors.airQuality || 42}
            unit="AQI"
            icon="leaf-outline"
            iconColor="#10B981"
            description="Good indoor air purity"
            statusText="Good"
            statusType="success"
          />
        </View>
      </View>

      {/* Pinned & Active Devices */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleGroup}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Quick Device Controls
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Favorites & active appliances
          </Text>
        </View>

        {navigation && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Devices')}
            style={styles.viewAllBtn}
          >
            <Text style={[styles.viewAllText, { color: theme.primary }]}>
              View All ({devices.length})
            </Text>
            <Ionicons name="arrow-forward" size={14} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>

      {devicesLoading && devices.length === 0 ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Syncing devices with hub...
          </Text>
        </View>
      ) : (
        displayDevices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            onEdit={(dev) => {
              setEditingDevice(dev);
              setModalVisible(true);
            }}
            onDelete={(dev) => deleteDevice(dev.id)}
          />
        ))
      )}

      {/* Recent Activity Logs */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleGroup}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Recent Activity
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Smart home event timeline
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.logsContainer,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowColor: theme.cardShadow,
          },
        ]}
      >
        {activityLogs.slice(0, 4).map((log) => {
          const typeIcons = {
            success: 'checkmark-circle-outline',
            warning: 'alert-circle-outline',
            error: 'close-circle-outline',
            info: 'information-circle-outline',
          };
          const typeColors = {
            success: theme.success,
            warning: theme.warning,
            error: theme.danger,
            info: theme.primary,
          };

          return (
            <View key={log.id} style={styles.logItem}>
              <Ionicons
                name={typeIcons[log.type] as any}
                size={18}
                color={typeColors[log.type]}
              />
              <View style={styles.logTextCol}>
                <Text style={[styles.logDevice, { color: theme.textPrimary }]}>
                  {log.deviceName}
                </Text>
                <Text style={[styles.logAction, { color: theme.textSecondary }]}>
                  {log.action}
                </Text>
              </View>
              <Text style={[styles.logTime, { color: theme.textMuted }]}>
                {log.timestamp}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Add / Edit Device Modal */}
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
    marginBottom: 18,
    marginTop: 4,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  quickAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scenesContainer: {
    paddingVertical: 4,
    paddingBottom: 16,
  },
  sensorGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sensorGridCol: {
    flex: 1,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  loadingWrapper: {
    padding: 30,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  logsContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  logTextCol: {
    flex: 1,
  },
  logDevice: {
    fontSize: 13,
    fontWeight: '600',
  },
  logAction: {
    fontSize: 12,
    marginTop: 1,
  },
  logTime: {
    fontSize: 11,
  },
});