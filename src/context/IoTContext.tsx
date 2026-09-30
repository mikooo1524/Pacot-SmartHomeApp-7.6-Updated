import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

import {
  Device,
  SensorData,
  SensorHistoryPoint,
  ActivityLog,
  AutomationScene,
  GatewayConfig,
  GatewayStatus,
  AppSettings,
  initialSensorData,
  defaultGatewayConfig,
  defaultAppSettings,
} from '../models/IoTModels';

import {
  getDevices,
  getSensorData,
  getSensorHistory,
  updateDeviceStatus,
  addDevice as addDeviceService,
  updateDevice as updateDeviceService,
  deleteDevice as deleteDeviceService,
  connectGateway as connectGatewayService,
  disconnectGateway as disconnectGatewayService,
  getGatewayStatus as getGatewayStatusService,
  getGatewayConfig as getGatewayConfigService,
  saveGatewayConfig as saveGatewayConfigService,
  getScenes as getScenesService,
  triggerScene as triggerSceneService,
  getActivityLogs as getActivityLogsService,
  getAppSettings as getAppSettingsService,
  saveAppSettings as saveAppSettingsService,
  resetDemoData as resetDemoDataService,
} from '../services/IoTService';

import { lightTheme, darkTheme, ThemeColors } from '../theme/theme';

export type DeviceError = {
  deviceId: number;
  value: boolean;
  message: string;
};

export type IoTContextType = {
  // State
  devices: Device[];
  sensors: SensorData;
  sensorHistory: SensorHistoryPoint[];
  activityLogs: ActivityLog[];
  scenes: AutomationScene[];

  gatewayConnected: boolean;
  gatewayConnecting: boolean;
  gatewayStatus: GatewayStatus | null;
  gatewayConfig: GatewayConfig;
  appSettings: AppSettings;

  devicesLoading: boolean;
  sensorsLoading: boolean;
  historyLoading: boolean;
  updatingDeviceIds: number[];

  devicesError: string | null;
  sensorsError: string | null;
  deviceError: DeviceError | null;

  selectedRoom: string;
  searchQuery: string;

  theme: ThemeColors;
  isDarkMode: boolean;

  // Computed Stats
  activeDeviceCount: number;
  totalPowerUsage: number;

  // Actions
  setSelectedRoom: (room: string) => void;
  setSearchQuery: (query: string) => void;
  toggleTheme: () => void;

  toggleDevice: (id: number, value: boolean) => Promise<void>;
  retryDeviceUpdate: () => Promise<void>;
  addDevice: (device: Omit<Device, 'id'>) => Promise<Device>;
  updateDevice: (id: number, updates: Partial<Device>) => Promise<Device>;
  deleteDevice: (id: number) => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;
  setDeviceBrightness: (id: number, brightness: number) => Promise<void>;
  setDeviceSpeed: (id: number, speed: number) => Promise<void>;
  setDeviceTargetTemp: (id: number, temp: number) => Promise<void>;
  turnAllDevices: (status: boolean) => Promise<void>;

  triggerScene: (sceneId: number) => Promise<string>;

  loadDevices: () => Promise<void>;
  refreshSensors: () => Promise<void>;
  loadSensorHistory: () => Promise<void>;
  refreshAll: () => Promise<void>;

  disconnectGateway: () => Promise<void>;
  connectGateway: (config?: GatewayConfig) => Promise<void>;
  saveGatewayConfig: (config: GatewayConfig) => Promise<void>;

  updateAppSettings: (settings: Partial<AppSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
};

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export function IoTProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [sensors, setSensors] = useState<SensorData>(initialSensorData);
  const [sensorHistory, setSensorHistory] = useState<SensorHistoryPoint[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [scenes, setScenes] = useState<AutomationScene[]>([]);

  const [gatewayConnected, setGatewayConnected] = useState(true);
  const [gatewayConnecting, setGatewayConnecting] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig>(defaultGatewayConfig);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);

  const [devicesLoading, setDevicesLoading] = useState(false);
  const [sensorsLoading, setSensorsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [updatingDeviceIds, setUpdatingDeviceIds] = useState<number[]>([]);

  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [sensorsError, setSensorsError] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState<DeviceError | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ----------------------------------------------------
  // Fetchers
  // ----------------------------------------------------
  const fetchDevices = useCallback(async () => {
    setDevicesLoading(true);
    setDevicesError(null);
    try {
      const data = await getDevices();
      setDevices(data);
    } catch (err: any) {
      setDevicesError(err.message || 'Unable to retrieve devices.');
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  const fetchSensors = useCallback(async () => {
    setSensorsLoading(true);
    setSensorsError(null);
    try {
      const data = await getSensorData();
      setSensors(data);
    } catch (err: any) {
      setSensorsError(err.message || 'Unable to retrieve sensor data.');
    } finally {
      setSensorsLoading(false);
    }
  }, []);

  const fetchSensorHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const history = await getSensorHistory();
      setSensorHistory(history);
    } catch {
      // silently fallback to current state
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchAuxiliaryData = useCallback(async () => {
    try {
      const [scenesData, logsData, statusData, configData, settingsData] =
        await Promise.all([
          getScenesService(),
          getActivityLogsService(),
          getGatewayStatusService(),
          getGatewayConfigService(),
          getAppSettingsService(),
        ]);
      setScenes(scenesData);
      setActivityLogs(logsData);
      setGatewayStatus(statusData);
      setGatewayConfig(configData);
      setAppSettings(settingsData);
    } catch {
      // Fallback
    }
  }, []);

  const refreshAll = useCallback(async () => {
    if (!gatewayConnected) return;
    await Promise.all([
      fetchDevices(),
      fetchSensors(),
      fetchSensorHistory(),
      fetchAuxiliaryData(),
    ]);
  }, [gatewayConnected, fetchDevices, fetchSensors, fetchSensorHistory, fetchAuxiliaryData]);

  // Initial load
  useEffect(() => {
    fetchDevices();
    fetchSensors();
    fetchSensorHistory();
    fetchAuxiliaryData();
  }, [fetchDevices, fetchSensors, fetchSensorHistory, fetchAuxiliaryData]);

  // ----------------------------------------------------
  // Device Actions
  // ----------------------------------------------------
  const toggleDevice = async (id: number, value: boolean) => {
    if (!gatewayConnected) return;

    const target = devices.find((device) => device.id === id);
    if (!target) return;

    const previousStatus = target.status;
    setDeviceError(null);

    // Optimistic UI update
    setDevices((current) =>
      current.map((device) =>
        device.id === id ? { ...device, status: value } : device
      )
    );

    setUpdatingDeviceIds((current) => [...current, id]);

    try {
      await updateDeviceStatus(id, value);
      // Refresh logs
      const updatedLogs = await getActivityLogsService();
      setActivityLogs(updatedLogs);
    } catch (err: any) {
      // Rollback on error
      setDevices((current) =>
        current.map((device) =>
          device.id === id ? { ...device, status: previousStatus } : device
        )
      );
      setDeviceError({
        deviceId: id,
        value,
        message: err.message || `Unable to update ${target.name}.`,
      });
    } finally {
      setUpdatingDeviceIds((current) =>
        current.filter((deviceId) => deviceId !== id)
      );
    }
  };

  const retryDeviceUpdate = async () => {
    if (!deviceError) return;
    await toggleDevice(deviceError.deviceId, deviceError.value);
  };

  const addDevice = async (newDeviceData: Omit<Device, 'id'>): Promise<Device> => {
    if (!gatewayConnected) {
      throw new Error('Cannot add device while gateway is disconnected.');
    }
    const created = await addDeviceService(newDeviceData);
    setDevices((current) => [created, ...current]);
    const updatedLogs = await getActivityLogsService();
    setActivityLogs(updatedLogs);
    return created;
  };

  const updateDevice = async (
    id: number,
    updates: Partial<Device>
  ): Promise<Device> => {
    if (!gatewayConnected) {
      throw new Error('Cannot update device while gateway is disconnected.');
    }
    const updated = await updateDeviceService(id, updates);
    setDevices((current) =>
      current.map((device) => (device.id === id ? updated : device))
    );
    const updatedLogs = await getActivityLogsService();
    setActivityLogs(updatedLogs);
    return updated;
  };

  const deleteDevice = async (id: number): Promise<void> => {
    if (!gatewayConnected) {
      throw new Error('Cannot delete device while gateway is disconnected.');
    }
    await deleteDeviceService(id);
    setDevices((current) => current.filter((d) => d.id !== id));
    const updatedLogs = await getActivityLogsService();
    setActivityLogs(updatedLogs);
  };

  const toggleFavorite = async (id: number) => {
    const target = devices.find((d) => d.id === id);
    if (!target) return;
    const isFav = !target.isFavorite;
    await updateDevice(id, { isFavorite: isFav });
  };

  const setDeviceBrightness = async (id: number, brightness: number) => {
    setDevices((current) =>
      current.map((d) => (d.id === id ? { ...d, brightness } : d))
    );
    await updateDeviceService(id, { brightness });
  };

  const setDeviceSpeed = async (id: number, speed: number) => {
    setDevices((current) =>
      current.map((d) => (d.id === id ? { ...d, speed } : d))
    );
    await updateDeviceService(id, { speed });
  };

  const setDeviceTargetTemp = async (id: number, targetTemperature: number) => {
    setDevices((current) =>
      current.map((d) => (d.id === id ? { ...d, targetTemperature } : d))
    );
    await updateDeviceService(id, { targetTemperature });
  };

  const turnAllDevices = async (status: boolean) => {
    if (!gatewayConnected) return;
    const original = [...devices];
    setDevices((current) => current.map((d) => ({ ...d, status })));
    try {
      await Promise.all(
        devices.map((d) => updateDeviceStatus(d.id, status).catch(() => null))
      );
      const updatedLogs = await getActivityLogsService();
      setActivityLogs(updatedLogs);
    } catch {
      setDevices(original);
    }
  };

  // ----------------------------------------------------
  // Scenes
  // ----------------------------------------------------
  const triggerScene = async (sceneId: number): Promise<string> => {
    if (!gatewayConnected) {
      throw new Error('Cannot execute scenes while gateway is offline.');
    }
    const result = await triggerSceneService(sceneId);
    await Promise.all([fetchDevices(), fetchAuxiliaryData()]);
    return result.message;
  };

  // ----------------------------------------------------
  // Gateway Actions
  // ----------------------------------------------------
  const disconnectGateway = async () => {
    await disconnectGatewayService();
    setGatewayConnected(false);
    setGatewayStatus((current) =>
      current ? { ...current, connected: false } : null
    );
    const updatedLogs = await getActivityLogsService();
    setActivityLogs(updatedLogs);
  };

  const connectGateway = async (config?: GatewayConfig) => {
    if (gatewayConnecting) return;
    setGatewayConnecting(true);
    try {
      const status = await connectGatewayService(config || gatewayConfig);
      setGatewayConnected(true);
      setGatewayStatus(status);
      setDeviceError(null);
      if (config) setGatewayConfig(config);
      await Promise.all([
        fetchDevices(),
        fetchSensors(),
        fetchSensorHistory(),
        fetchAuxiliaryData(),
      ]);
    } finally {
      setGatewayConnecting(false);
    }
  };

  const saveGatewayConfig = async (config: GatewayConfig) => {
    const updated = await saveGatewayConfigService(config);
    setGatewayConfig(updated);
  };

  // ----------------------------------------------------
  // Settings & Theme
  // ----------------------------------------------------
  const updateAppSettings = async (settings: Partial<AppSettings>) => {
    const updated = await saveAppSettingsService(settings);
    setAppSettings(updated);
  };

  const toggleTheme = () => {
    const newDarkMode = !appSettings.darkMode;
    updateAppSettings({ darkMode: newDarkMode });
  };

  const resetToDefaults = async () => {
    resetDemoDataService();
    await refreshAll();
  };

  // ----------------------------------------------------
  // Derived State / Themes
  // ----------------------------------------------------
  const isDarkMode = appSettings.darkMode;
  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  const activeDeviceCount = useMemo(
    () => devices.filter((d) => d.status).length,
    [devices]
  );

  const totalPowerUsage = useMemo(
    () =>
      devices
        .filter((d) => d.status)
        .reduce((sum, d) => sum + (d.powerUsage || 0), 0),
    [devices]
  );

  return (
    <IoTContext.Provider
      value={{
        devices,
        sensors,
        sensorHistory,
        activityLogs,
        scenes,
        gatewayConnected,
        gatewayConnecting,
        gatewayStatus,
        gatewayConfig,
        appSettings,
        devicesLoading,
        sensorsLoading,
        historyLoading,
        updatingDeviceIds,
        devicesError,
        sensorsError,
        deviceError,
        selectedRoom,
        searchQuery,
        theme,
        isDarkMode,
        activeDeviceCount,
        totalPowerUsage,
        setSelectedRoom,
        setSearchQuery,
        toggleTheme,
        toggleDevice,
        retryDeviceUpdate,
        addDevice,
        updateDevice,
        deleteDevice,
        toggleFavorite,
        setDeviceBrightness,
        setDeviceSpeed,
        setDeviceTargetTemp,
        turnAllDevices,
        triggerScene,
        loadDevices: fetchDevices,
        refreshSensors: fetchSensors,
        loadSensorHistory: fetchSensorHistory,
        refreshAll,
        disconnectGateway,
        connectGateway,
        saveGatewayConfig,
        updateAppSettings,
        resetToDefaults,
      }}
    >
      {children}
    </IoTContext.Provider>
  );
}

export function useIoT() {
  const context = useContext(IoTContext);
  if (!context) {
    throw new Error('useIoT must be used inside IoTProvider');
  }
  return context;
}
