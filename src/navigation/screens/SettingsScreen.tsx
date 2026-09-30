import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../../context/IoTContext';
import SuccessBanner from '../../components/SuccessBanner';
import GatewayConfigModal from '../../components/GatewayConfigModal';
import ApiDocsModal from '../../components/ApiDocsModal';

export default function SettingsScreen() {
  const {
    gatewayConnected,
    gatewayConnecting,
    gatewayStatus,
    gatewayConfig,
    appSettings,
    theme,
    isDarkMode,
    devices,
    totalPowerUsage,
    connectGateway,
    disconnectGateway,
    updateAppSettings,
    resetToDefaults,
  } = useIoT();

  const [homeName, setHomeName] = useState(appSettings.homeName || 'My Smart Home');
  const [isEditingName, setIsEditingName] = useState(false);
  const [gatewayModalVisible, setGatewayModalVisible] = useState(false);
  const [apiDocsVisible, setApiDocsVisible] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleToggleNotifications = (val: boolean) => {
    updateAppSettings({ notifications: val });
  };

  const handleToggleAutoConnect = (val: boolean) => {
    updateAppSettings({ autoConnect: val });
  };

  const handleToggleDarkMode = (val: boolean) => {
    updateAppSettings({ darkMode: val });
  };

  const handleToggleTempUnit = (val: boolean) => {
    updateAppSettings({ temperatureUnit: val ? 'F' : 'C' });
  };

  const handleSaveHomeName = () => {
    updateAppSettings({ homeName: homeName.trim() || 'My Smart Home' });
    setIsEditingName(false);
    setSuccessMsg('Smart home name updated.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleResetData = () => {
    const doReset = async () => {
      await resetToDefaults();
      setSuccessMsg('Reset all state to initial demo data.');
      setTimeout(() => setSuccessMsg(null), 3000);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Reset all smart home devices, sensors, and logs to default demo state?')) {
        doReset();
      }
    } else {
      Alert.alert(
        'Reset Demo Data',
        'Reset all smart home devices, sensors, and logs to default demo state?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset', style: 'destructive', onPress: doReset },
        ]
      );
    }
  };

  // Estimated daily energy cost = (power in kW) * 24 hours * cost per kWh
  const estimatedDailyCost = (
    (totalPowerUsage / 1000) *
    24 *
    appSettings.energyCostPerKwh
  ).toFixed(2);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Settings
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Configure application preferences & IoT gateway integration
      </Text>

      {/* Success Notification */}
      {successMsg && (
        <SuccessBanner
          message={successMsg}
          onDismiss={() => setSuccessMsg(null)}
        />
      )}

      {/* Smart Home Profile */}
      <View style={styles.sectionHeader}>
        <Ionicons name="home-outline" size={18} color={theme.primary} />
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Smart Home Profile
        </Text>
      </View>

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
        <View style={styles.profileRow}>
          <View
            style={[
              styles.profileIconCircle,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Ionicons
              name="home"
              size={24}
              color={theme.primary}
            />
          </View>

          <View style={styles.profileInfo}>
            {isEditingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={[
                    styles.nameInput,
                    {
                      backgroundColor: theme.surfaceSubdued,
                      color: theme.textPrimary,
                      borderColor: theme.primary,
                    },
                  ]}
                  value={homeName}
                  onChangeText={setHomeName}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={handleSaveHomeName}
                  style={[styles.nameSaveBtn, { backgroundColor: theme.primary }]}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameDisplayRow}>
                <Text style={[styles.profileName, { color: theme.textPrimary }]}>
                  {appSettings.homeName || 'My Smart Home'}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsEditingName(true)}
                  style={styles.editIconBtn}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={16}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              </View>
            )}

            <Text style={[styles.profileSub, { color: theme.textSecondary }]}>
              {devices.length} Devices connected • Smart Automation Active
            </Text>
          </View>
        </View>
      </View>

      {/* Gateway & Network Connection */}
      <View style={styles.sectionHeader}>
        <Ionicons name="server-outline" size={18} color={theme.primary} />
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          IoT Gateway Connection
        </Text>
      </View>

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
        <View style={styles.gatewayStatusRow}>
          <View
            style={[
              styles.gatewayStatusBadge,
              {
                backgroundColor: gatewayConnected
                  ? theme.successLight
                  : theme.dangerLight,
              },
            ]}
          >
            <Ionicons
              name={
                gatewayConnected
                  ? 'cloud-done-outline'
                  : 'cloud-offline-outline'
              }
              size={24}
              color={gatewayConnected ? theme.success : theme.danger}
            />
          </View>

          <View style={styles.gatewayInfoCol}>
            <View style={styles.gatewayTitleRow}>
              <Text style={[styles.gatewayTitle, { color: theme.textPrimary }]}>
                {gatewayConfig.protocol} Gateway Hub
              </Text>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: gatewayConnected
                      ? theme.successLight
                      : theme.dangerLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    {
                      color: gatewayConnected
                        ? theme.success
                        : theme.danger,
                    },
                  ]}
                >
                  {gatewayConnecting
                    ? 'Connecting...'
                    : gatewayConnected
                    ? 'Online'
                    : 'Offline'}
                </Text>
              </View>
            </View>

            <Text style={[styles.gatewayDetails, { color: theme.textSecondary }]}>
              Endpoint: {gatewayConfig.host}:{gatewayConfig.port}
              {gatewayStatus?.latency
                ? ` • Ping: ${gatewayStatus.latency}ms`
                : ''}
            </Text>
          </View>
        </View>

        {/* Action Buttons for Gateway */}
        <View style={styles.gatewayActionsRow}>
          <TouchableOpacity
            style={[
              styles.configBtn,
              { backgroundColor: theme.surfaceSubdued, borderColor: theme.border },
            ]}
            onPress={() => setGatewayModalVisible(true)}
          >
            <Ionicons name="settings-outline" size={16} color={theme.textPrimary} />
            <Text style={[styles.configBtnText, { color: theme.textPrimary }]}>
              Configure Network
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleConnectBtn,
              {
                backgroundColor: gatewayConnected ? theme.danger : theme.primary,
              },
              gatewayConnecting && styles.btnDisabled,
            ]}
            disabled={gatewayConnecting}
            onPress={gatewayConnected ? disconnectGateway : () => connectGateway()}
          >
            {gatewayConnecting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name={gatewayConnected ? 'power-outline' : 'refresh-outline'}
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.toggleConnectBtnText}>
                  {gatewayConnected ? 'Disconnect' : 'Connect Hub'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* General App Settings */}
      <View style={styles.sectionHeader}>
        <Ionicons name="options-outline" size={18} color={theme.primary} />
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Application Preferences
        </Text>
      </View>

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
        {/* Dark Mode */}
        <View style={styles.settingItem}>
          <View style={styles.settingTextCol}>
            <View style={styles.settingIconTitle}>
              <Ionicons
                name={isDarkMode ? 'moon' : 'moon-outline'}
                size={20}
                color={theme.primary}
              />
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                Dark Appearance
              </Text>
            </View>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
              Switch between sleek dark and clean light mode
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            trackColor={{
              false: theme.switchTrackInactive,
              true: theme.primary,
            }}
            thumbColor={'#FFFFFF'}
            onValueChange={handleToggleDarkMode}
          />
        </View>

        {/* Push Notifications */}
        <View style={[styles.settingItem, styles.settingBorderTop, { borderTopColor: theme.border }]}>
          <View style={styles.settingTextCol}>
            <View style={styles.settingIconTitle}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={theme.primary}
              />
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                Alert Notifications
              </Text>
            </View>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
              Receive alarms for high temperature, motion, or offline devices
            </Text>
          </View>
          <Switch
            value={appSettings.notifications}
            trackColor={{
              false: theme.switchTrackInactive,
              true: theme.primary,
            }}
            thumbColor={'#FFFFFF'}
            onValueChange={handleToggleNotifications}
          />
        </View>

        {/* Auto Connect on Launch */}
        <View style={[styles.settingItem, styles.settingBorderTop, { borderTopColor: theme.border }]}>
          <View style={styles.settingTextCol}>
            <View style={styles.settingIconTitle}>
              <Ionicons name="wifi-outline" size={20} color={theme.primary} />
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                Auto-Connect on Launch
              </Text>
            </View>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
              Automatically handshake with the IoT Gateway when app opens
            </Text>
          </View>
          <Switch
            value={appSettings.autoConnect}
            trackColor={{
              false: theme.switchTrackInactive,
              true: theme.primary,
            }}
            thumbColor={'#FFFFFF'}
            onValueChange={handleToggleAutoConnect}
          />
        </View>

        {/* Temperature Unit */}
        <View style={[styles.settingItem, styles.settingBorderTop, { borderTopColor: theme.border }]}>
          <View style={styles.settingTextCol}>
            <View style={styles.settingIconTitle}>
              <Ionicons
                name="thermometer-outline"
                size={20}
                color={theme.primary}
              />
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                Fahrenheit Unit (°F)
              </Text>
            </View>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
              Display telemetry in Fahrenheit instead of Celsius
            </Text>
          </View>
          <Switch
            value={appSettings.temperatureUnit === 'F'}
            trackColor={{
              false: theme.switchTrackInactive,
              true: theme.primary,
            }}
            thumbColor={'#FFFFFF'}
            onValueChange={handleToggleTempUnit}
          />
        </View>
      </View>

      {/* Energy Rate & Cost Estimator */}
      <View style={styles.sectionHeader}>
        <Ionicons name="flash-outline" size={18} color="#F59E0B" />
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Energy Management
        </Text>
      </View>

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
        <View style={styles.energyRow}>
          <View>
            <Text style={[styles.energyTitle, { color: theme.textPrimary }]}>
              Current Draw: {totalPowerUsage} Watts
            </Text>
            <Text style={[styles.energySub, { color: theme.textSecondary }]}>
              Electricity Rate: ${appSettings.energyCostPerKwh}/kWh
            </Text>
          </View>
          <View style={styles.costBadge}>
            <Text style={[styles.costVal, { color: theme.primary }]}>
              ${estimatedDailyCost}
            </Text>
            <Text style={[styles.costSub, { color: theme.textMuted }]}>
              est. per day
            </Text>
          </View>
        </View>
      </View>

      {/* Developer & Backend Integration */}
      <View style={styles.sectionHeader}>
        <Ionicons name="code-slash-outline" size={18} color={theme.accent} />
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Backend Integration & Diagnostics
        </Text>
      </View>

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
        <TouchableOpacity
          style={styles.diagRow}
          onPress={() => setApiDocsVisible(true)}
        >
          <View style={styles.diagInfo}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color={theme.accent}
            />
            <View style={styles.diagTextCol}>
              <Text style={[styles.diagTitle, { color: theme.textPrimary }]}>
                API Endpoints Contract
              </Text>
              <Text style={[styles.diagSub, { color: theme.textSecondary }]}>
                View REST endpoints and JSON schemas for backend setup
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.diagRow, styles.settingBorderTop, { borderTopColor: theme.border }]}
          onPress={handleResetData}
        >
          <View style={styles.diagInfo}>
            <Ionicons name="reload-outline" size={22} color={theme.danger} />
            <View style={styles.diagTextCol}>
              <Text style={[styles.diagTitle, { color: theme.danger }]}>
                Reset Demo Data
              </Text>
              <Text style={[styles.diagSub, { color: theme.textSecondary }]}>
                Restore default devices, sensors, scenes, and logs
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* App Info Footer */}
      <View style={styles.appInfoContainer}>
        <Ionicons
          name="hardware-chip"
          size={24}
          color={theme.primary}
          style={{ marginBottom: 6 }}
        />
        <Text style={[styles.appInfoTitle, { color: theme.textPrimary }]}>
          Smart Home IoT Controller
        </Text>
        <Text style={[styles.appInfoSub, { color: theme.textMuted }]}>
          Version 1.0.0 • React Native & Expo SDK 57
        </Text>
        <Text style={[styles.appInfoReady, { color: theme.success }]}>
          ✓ Frontend Architecture Ready for Backend Integration
        </Text>
      </View>

      {/* Gateway Config Modal */}
      <GatewayConfigModal
        visible={gatewayModalVisible}
        onClose={() => setGatewayModalVisible(false)}
      />

      {/* API Documentation Modal */}
      <ApiDocsModal
        visible={apiDocsVisible}
        onClose={() => setApiDocsVisible(false)}
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
    paddingBottom: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
  },
  editIconBtn: {
    padding: 2,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  nameSaveBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSub: {
    fontSize: 12,
    marginTop: 3,
  },
  gatewayStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  gatewayStatusBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  gatewayInfoCol: {
    flex: 1,
  },
  gatewayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gatewayTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gatewayDetails: {
    fontSize: 12,
    marginTop: 3,
  },
  gatewayActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  configBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  configBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleConnectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  toggleConnectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingBorderTop: {
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 14,
  },
  settingTextCol: {
    flex: 1,
    marginRight: 12,
  },
  settingIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  energyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  energySub: {
    fontSize: 12,
    marginTop: 2,
  },
  costBadge: {
    alignItems: 'flex-end',
  },
  costVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  costSub: {
    fontSize: 10,
  },
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  diagInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  diagTextCol: {
    flex: 1,
  },
  diagTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  diagSub: {
    fontSize: 11,
    marginTop: 2,
  },
  appInfoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  appInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  appInfoSub: {
    fontSize: 11,
    marginTop: 2,
  },
  appInfoReady: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});