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
import SensorCard from '../../components/SensorCard';
import SensorChart from '../../components/SensorChart';

export default function SensorsScreen() {
  const {
    sensors,
    sensorHistory,
    sensorsLoading,
    historyLoading,
    sensorsError,
    gatewayConnected,
    gatewayConnecting,
    theme,
    appSettings,
    refreshSensors,
    loadSensorHistory,
    connectGateway,
    updateAppSettings,
  } = useIoT();

  const [refreshing, setRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isFahrenheit = appSettings.temperatureUnit === 'F';

  // Temperature conversion
  const displayTemp = isFahrenheit
    ? Math.round((sensors.temperature * 9) / 5 + 32)
    : sensors.temperature;
  const tempUnit = isFahrenheit ? '°F' : '°C';

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSensors(), loadSensorHistory()]);
    setRefreshing(false);
    setSuccessMsg('Telemetry updated successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const toggleTempUnit = () => {
    const nextUnit = isFahrenheit ? 'C' : 'F';
    updateAppSettings({ temperatureUnit: nextUnit });
  };

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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Sensors & Telemetry
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Environmental sensors • Last updated {sensors.lastUpdated || 'Live'}
          </Text>
        </View>

        {/* Unit Toggle Button */}
        <TouchableOpacity
          onPress={toggleTempUnit}
          style={[styles.unitToggle, { backgroundColor: theme.surfaceSubdued }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.unitToggleText, { color: theme.textPrimary }]}>
            {isFahrenheit ? '°F (US)' : '°C (Metric)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications / Errors */}
      {successMsg && (
        <SuccessBanner
          message={successMsg}
          onDismiss={() => setSuccessMsg(null)}
        />
      )}

      {!gatewayConnected && (
        <ErrorBanner
          message="IoT Gateway is disconnected. Sensor feed paused."
          onRetry={connectGateway}
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

      {/* Action Bar (Refresh Button) */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[
            styles.refreshButton,
            { backgroundColor: theme.primary },
            (sensorsLoading || !gatewayConnected) && styles.refreshDisabled,
          ]}
          onPress={handleRefresh}
          disabled={sensorsLoading || !gatewayConnected}
          activeOpacity={0.8}
        >
          {sensorsLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Ionicons name="refresh-outline" size={18} color="#ffffff" />
          )}
          <Text style={styles.refreshText}>
            {sensorsLoading ? 'Reading Telemetry...' : 'Refresh Sensors'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 24-Hour Telemetry Trends Chart */}
      {sensorHistory.length > 0 && (
        <SensorChart data={sensorHistory} />
      )}

      {/* Main Sensor Metrics */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        Live Room Sensors
      </Text>

      {/* Temperature Card */}
      <SensorCard
        title="Ambient Temperature"
        value={displayTemp}
        unit={tempUnit}
        icon="thermometer-outline"
        iconColor="#EF4444"
        description="Measured by DHT22 internal ambient sensor"
        statusText={
          sensors.temperature > 32
            ? 'High Heat'
            : sensors.temperature < 18
            ? 'Cool'
            : 'Optimal Range'
        }
        statusType={
          sensors.temperature > 32
            ? 'danger'
            : sensors.temperature < 18
            ? 'info'
            : 'success'
        }
      />

      {/* Humidity Card */}
      <SensorCard
        title="Relative Humidity"
        value={sensors.humidity}
        unit="%"
        icon="water-outline"
        iconColor="#3B82F6"
        description="Indoor relative humidity level"
        statusText={
          sensors.humidity > 70
            ? 'Humid'
            : sensors.humidity < 40
            ? 'Dry'
            : 'Comfortable'
        }
        statusType={
          sensors.humidity > 70
            ? 'warning'
            : sensors.humidity < 40
            ? 'warning'
            : 'success'
        }
      />

      {/* Ambient Light Level */}
      <SensorCard
        title="Ambient Light Level"
        value={sensors.lightLevel}
        unit="lux"
        icon="sunny-outline"
        iconColor="#F59E0B"
        description="Photocell light sensor reading"
        statusText={
          sensors.lightLevel > 750
            ? 'Bright Sunshine'
            : sensors.lightLevel > 300
            ? 'Moderate'
            : 'Dim / Night'
        }
        statusType="info"
      />

      {/* Air Quality Index */}
      <SensorCard
        title="Indoor Air Quality"
        value={sensors.airQuality || 42}
        unit="AQI"
        icon="leaf-outline"
        iconColor="#10B981"
        description="VOC & particulate matter evaluation"
        statusText="Good Air Quality"
        statusType="success"
      />

      {/* Secondary Sensor Row (Motion & Noise) */}
      <View style={styles.sensorRow}>
        <View style={styles.sensorHalf}>
          <SensorCard
            title="PIR Motion"
            value={sensors.motionDetected ? 'Detected' : 'Clear'}
            icon="walk-outline"
            iconColor={sensors.motionDetected ? '#EF4444' : '#10B981'}
            description="Infrared motion detection"
            statusText={sensors.motionDetected ? 'Active' : 'Idle'}
            statusType={sensors.motionDetected ? 'warning' : 'success'}
          />
        </View>

        <View style={styles.sensorHalf}>
          <SensorCard
            title="Noise Level"
            value={sensors.noiseLevel || 38}
            unit="dB"
            icon="mic-outline"
            iconColor="#8B5CF6"
            description="Ambient sound level"
            statusText="Quiet Room"
            statusType="success"
          />
        </View>
      </View>

      {/* Sensor Calibration & Target Thresholds Reference */}
      <View
        style={[
          styles.thresholdsCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowColor: theme.cardShadow,
          },
        ]}
      >
        <View style={styles.thresholdsHeader}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={theme.primary}
          />
          <Text style={[styles.thresholdsTitle, { color: theme.textPrimary }]}>
            Recommended Indoor Thresholds
          </Text>
        </View>

        <View style={styles.thresholdItem}>
          <Text style={[styles.threshLabel, { color: theme.textSecondary }]}>
            Ideal Temperature:
          </Text>
          <Text style={[styles.threshVal, { color: theme.textPrimary }]}>
            20°C – 26°C (68°F – 78°F)
          </Text>
        </View>

        <View style={styles.thresholdItem}>
          <Text style={[styles.threshLabel, { color: theme.textSecondary }]}>
            Ideal Humidity:
          </Text>
          <Text style={[styles.threshVal, { color: theme.textPrimary }]}>
            40% – 60% RH
          </Text>
        </View>

        <View style={styles.thresholdItem}>
          <Text style={[styles.threshLabel, { color: theme.textSecondary }]}>
            Working Light Level:
          </Text>
          <Text style={[styles.threshVal, { color: theme.textPrimary }]}>
            400 – 750 lux
          </Text>
        </View>

        <View style={styles.thresholdItem}>
          <Text style={[styles.threshLabel, { color: theme.textSecondary }]}>
            Clean Air (AQI):
          </Text>
          <Text style={[styles.threshVal, { color: theme.textPrimary }]}>
            0 – 50 (Good)
          </Text>
        </View>
      </View>
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
  headerTextCol: {
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
  unitToggle: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  unitToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionBar: {
    marginBottom: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  refreshDisabled: {
    opacity: 0.6,
  },
  refreshText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 14,
  },
  sensorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sensorHalf: {
    flex: 1,
  },
  thresholdsCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  thresholdsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  thresholdsTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  thresholdItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  threshLabel: {
    fontSize: 12,
  },
  threshVal: {
    fontSize: 12,
    fontWeight: '600',
  },
});