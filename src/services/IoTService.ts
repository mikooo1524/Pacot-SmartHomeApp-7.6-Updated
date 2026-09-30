import {
  Device,
  SensorData,
  SensorHistoryPoint,
  ActivityLog,
  AutomationScene,
  GatewayConfig,
  GatewayStatus,
  AppSettings,
  sampleDevices,
  initialSensorData,
  sampleSensorHistory,
  sampleScenes,
  sampleActivityLogs,
  defaultGatewayConfig,
  defaultAppSettings,
} from '../models/IoTModels';
import { API_CONFIG, apiRequest } from './apiConfig';

// ==========================================
// SIMULATED IN-MEMORY DATABASE (MOCK MODE)
// ==========================================
let serverDevices: Device[] = sampleDevices.map((d) => ({ ...d }));
let serverSensors: SensorData = { ...initialSensorData };
let serverSensorHistory: SensorHistoryPoint[] = [...sampleSensorHistory];
let serverScenes: AutomationScene[] = sampleScenes.map((s) => ({ ...s }));
let serverActivityLogs: ActivityLog[] = [...sampleActivityLogs];
let serverGatewayConfig: GatewayConfig = { ...defaultGatewayConfig };
let serverAppSettings: AppSettings = { ...defaultAppSettings };
let isGatewayOnline = true;

const delay = (ms: number = API_CONFIG.MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const shouldFail = () => Math.random() < API_CONFIG.SIMULATED_FAILURE_RATE;

const randomBetween = (min: number, max: number) =>
  Math.round(min + Math.random() * (max - min));

// Helper to record activity logs
function logActivity(
  deviceName: string,
  action: string,
  type: ActivityLog['type'] = 'info'
) {
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: 'Just now',
    deviceName,
    action,
    type,
  };
  serverActivityLogs = [newLog, ...serverActivityLogs.slice(0, 19)];
}

// ==========================================
// SENSOR SERVICE
// ==========================================

/**
 * Fetch latest sensor telemetry (Temperature, Humidity, Light, AQI)
 */
export async function getSensorData(): Promise<SensorData> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<SensorData>(API_CONFIG.ENDPOINTS.SENSORS_CURRENT);
  }

  await delay(600);

  if (shouldFail()) {
    throw new Error('Unable to retrieve sensor data. Check gateway connection.');
  }

  const updatedSensors: SensorData = {
    temperature: randomBetween(22, 33),
    humidity: randomBetween(45, 78),
    lightLevel: randomBetween(280, 950),
    airQuality: randomBetween(25, 65),
    motionDetected: Math.random() > 0.7,
    noiseLevel: randomBetween(30, 60),
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  serverSensors = updatedSensors;
  return { ...serverSensors };
}

/**
 * Fetch historical sensor data for trend analysis
 */
export async function getSensorHistory(): Promise<SensorHistoryPoint[]> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<SensorHistoryPoint[]>(API_CONFIG.ENDPOINTS.SENSORS_HISTORY);
  }

  await delay(500);

  if (shouldFail()) {
    throw new Error('Unable to retrieve sensor history logs.');
  }

  return [...serverSensorHistory];
}

// ==========================================
// DEVICE SERVICE (FULL CRUD)
// ==========================================

/**
 * Fetch all registered devices with optional room or type filters
 */
export async function getDevices(
  room?: string,
  type?: string
): Promise<Device[]> {
  if (!API_CONFIG.USE_MOCK_API) {
    const params = new URLSearchParams();
    if (room && room !== 'All') params.append('room', room);
    if (type && type !== 'All') params.append('type', type);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<Device[]>(`${API_CONFIG.ENDPOINTS.DEVICES}${query}`);
  }

  await delay(700);

  if (shouldFail()) {
    throw new Error('Unable to retrieve devices. Failed to sync with hub.');
  }

  let result = serverDevices.map((device) => ({ ...device }));
  if (room && room !== 'All') {
    result = result.filter((d) => d.room === room);
  }
  if (type && type !== 'All') {
    result = result.filter((d) => d.type === type);
  }

  return result;
}

/**
 * Fetch single device details by ID
 */
export async function getDeviceById(id: number): Promise<Device> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<Device>(API_CONFIG.ENDPOINTS.DEVICE_DETAIL(id));
  }

  await delay(300);
  const device = serverDevices.find((item) => item.id === id);
  if (!device) {
    throw new Error(`Device with ID ${id} was not found.`);
  }
  return { ...device };
}

/**
 * Create/Register a new smart home device
 */
export async function addDevice(
  newDeviceData: Omit<Device, 'id'>
): Promise<Device> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<Device>(API_CONFIG.ENDPOINTS.DEVICES, {
      method: 'POST',
      body: JSON.stringify(newDeviceData),
    });
  }

  await delay(700);

  if (!newDeviceData.name || newDeviceData.name.trim() === '') {
    throw new Error('Device name cannot be empty.');
  }

  const nextId =
    serverDevices.length > 0
      ? Math.max(...serverDevices.map((d) => d.id)) + 1
      : 1;

  const createdDevice: Device = {
    ...newDeviceData,
    id: nextId,
    lastUpdated: 'Just now',
  };

  serverDevices = [createdDevice, ...serverDevices];
  logActivity(createdDevice.name, `New device paired (${createdDevice.type})`, 'success');

  return { ...createdDevice };
}

/**
 * Update device general properties (name, room, brightness, targetTemp, speed, etc.)
 */
export async function updateDevice(
  id: number,
  updates: Partial<Device>
): Promise<Device> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<Device>(API_CONFIG.ENDPOINTS.DEVICE_DETAIL(id), {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  await delay(500);

  const index = serverDevices.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Device with ID ${id} not found.`);
  }

  const updated: Device = {
    ...serverDevices[index],
    ...updates,
    id,
    lastUpdated: 'Just now',
  };

  serverDevices[index] = updated;
  logActivity(updated.name, 'Device properties updated', 'info');

  return { ...updated };
}

/**
 * Toggle device status (ON / OFF)
 */
export async function updateDeviceStatus(
  id: number,
  status: boolean
): Promise<Device> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<Device>(API_CONFIG.ENDPOINTS.DEVICE_STATUS(id), {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  await delay(500);

  const device = serverDevices.find((item) => item.id === id);
  if (!device) {
    throw new Error('Device not found.');
  }

  if (shouldFail()) {
    throw new Error(`Unable to communicate with ${device.name}. Command timed out.`);
  }

  device.status = status;
  device.lastUpdated = 'Just now';

  logActivity(
    device.name,
    `Turned ${status ? 'ON' : 'OFF'}`,
    status ? 'success' : 'info'
  );

  return { ...device };
}

/**
 * Delete / Unpair a device
 */
export async function deleteDevice(id: number): Promise<boolean> {
  if (!API_CONFIG.USE_MOCK_API) {
    await apiRequest<void>(API_CONFIG.ENDPOINTS.DEVICE_DETAIL(id), {
      method: 'DELETE',
    });
    return true;
  }

  await delay(600);

  const target = serverDevices.find((d) => d.id === id);
  if (!target) {
    throw new Error('Device not found.');
  }

  serverDevices = serverDevices.filter((item) => item.id !== id);
  logActivity(target.name, 'Device removed from system', 'warning');

  return true;
}

// ==========================================
// GATEWAY SERVICE
// ==========================================

/**
 * Connect / Authenticate with the IoT Gateway
 */
export async function connectGateway(
  config?: GatewayConfig
): Promise<GatewayStatus> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<GatewayStatus>(API_CONFIG.ENDPOINTS.GATEWAY_CONNECT, {
      method: 'POST',
      body: config ? JSON.stringify(config) : undefined,
    });
  }

  await delay(900);

  if (config) {
    serverGatewayConfig = { ...config };
  }

  isGatewayOnline = true;
  logActivity('IoT Gateway', 'Connected successfully to local hub', 'success');

  return {
    connected: true,
    ip: serverGatewayConfig.host,
    uptime: '14d 6h 32m',
    latency: randomBetween(12, 38),
    connectedClients: serverDevices.length,
    lastPing: 'Just now',
  };
}

/**
 * Disconnect from the IoT Gateway
 */
export async function disconnectGateway(): Promise<void> {
  if (!API_CONFIG.USE_MOCK_API) {
    await apiRequest<void>(API_CONFIG.ENDPOINTS.GATEWAY_DISCONNECT, {
      method: 'POST',
    });
    return;
  }

  await delay(400);
  isGatewayOnline = false;
  logActivity('IoT Gateway', 'Gateway disconnected by user', 'warning');
}

/**
 * Get current Gateway health status
 */
export async function getGatewayStatus(): Promise<GatewayStatus> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<GatewayStatus>(API_CONFIG.ENDPOINTS.GATEWAY_STATUS);
  }

  await delay(400);

  return {
    connected: isGatewayOnline,
    ip: serverGatewayConfig.host,
    uptime: isGatewayOnline ? '14d 6h 32m' : 'Offline',
    latency: isGatewayOnline ? randomBetween(15, 45) : 0,
    connectedClients: isGatewayOnline ? serverDevices.length : 0,
    lastPing: isGatewayOnline ? 'Just now' : 'N/A',
  };
}

/**
 * Get stored Gateway network configuration
 */
export async function getGatewayConfig(): Promise<GatewayConfig> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<GatewayConfig>(API_CONFIG.ENDPOINTS.GATEWAY_CONFIG);
  }

  await delay(300);
  return { ...serverGatewayConfig };
}

/**
 * Save / Update Gateway network configuration
 */
export async function saveGatewayConfig(
  config: GatewayConfig
): Promise<GatewayConfig> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<GatewayConfig>(API_CONFIG.ENDPOINTS.GATEWAY_CONFIG, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  await delay(600);
  serverGatewayConfig = { ...config };
  logActivity('IoT Gateway', 'Gateway network parameters updated', 'info');
  return { ...serverGatewayConfig };
}

// ==========================================
// SCENES & AUTOMATION SERVICE
// ==========================================

/**
 * Fetch automation scenes
 */
export async function getScenes(): Promise<AutomationScene[]> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<AutomationScene[]>(API_CONFIG.ENDPOINTS.SCENES);
  }

  await delay(400);
  return serverScenes.map((s) => ({ ...s }));
}

/**
 * Trigger an automation scene
 */
export async function triggerScene(
  sceneId: number
): Promise<{ success: boolean; message: string }> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.SCENE_TRIGGER(sceneId),
      { method: 'POST' }
    );
  }

  await delay(700);

  const scene = serverScenes.find((s) => s.id === sceneId);
  if (!scene) {
    throw new Error('Scene not found.');
  }

  // Update scene active states
  serverScenes = serverScenes.map((s) => ({
    ...s,
    isActive: s.id === sceneId,
  }));

  // Perform mock actions on devices based on the triggered scene
  if (scene.name === 'Good Night') {
    serverDevices = serverDevices.map((d) => {
      if (d.type === 'Smart Light') return { ...d, status: false };
      if (d.type === 'Smart Lock') return { ...d, status: true };
      if (d.name === 'Bedroom Fan') return { ...d, status: true, speed: 2 };
      return d;
    });
  } else if (scene.name === 'Arrive Home') {
    serverDevices = serverDevices.map((d) => {
      if (d.name === 'Living Room Light') return { ...d, status: true, brightness: 80 };
      if (d.name === 'Front Door Lock') return { ...d, status: false };
      if (d.type === 'Thermostat') return { ...d, status: true, targetTemperature: 23 };
      return d;
    });
  } else if (scene.name === 'Energy Saver') {
    serverDevices = serverDevices.map((d) => {
      if (d.type === 'Smart Plug') return { ...d, status: false };
      if (d.type === 'Smart Light') return { ...d, status: false };
      return d;
    });
  }

  logActivity('Automation Scene', `Scene "${scene.name}" executed`, 'success');

  return {
    success: true,
    message: `Scene "${scene.name}" activated successfully.`,
  };
}

// ==========================================
// ACTIVITY LOGS SERVICE
// ==========================================

/**
 * Fetch recent activity events
 */
export async function getActivityLogs(): Promise<ActivityLog[]> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<ActivityLog[]>(API_CONFIG.ENDPOINTS.ACTIVITY_LOGS);
  }

  await delay(300);
  return [...serverActivityLogs];
}

// ==========================================
// APP SETTINGS SERVICE
// ==========================================

/**
 * Fetch stored user application preferences
 */
export async function getAppSettings(): Promise<AppSettings> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<AppSettings>(API_CONFIG.ENDPOINTS.SETTINGS);
  }

  await delay(200);
  return { ...serverAppSettings };
}

/**
 * Save user application preferences
 */
export async function saveAppSettings(
  settings: Partial<AppSettings>
): Promise<AppSettings> {
  if (!API_CONFIG.USE_MOCK_API) {
    return apiRequest<AppSettings>(API_CONFIG.ENDPOINTS.SETTINGS, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  await delay(400);
  serverAppSettings = { ...serverAppSettings, ...settings };
  return { ...serverAppSettings };
}

/**
 * Reset mock database to defaults (useful for testing and demonstrations)
 */
export function resetDemoData() {
  serverDevices = sampleDevices.map((d) => ({ ...d }));
  serverSensors = { ...initialSensorData };
  serverSensorHistory = [...sampleSensorHistory];
  serverScenes = sampleScenes.map((s) => ({ ...s }));
  serverActivityLogs = [...sampleActivityLogs];
  serverGatewayConfig = { ...defaultGatewayConfig };
  serverAppSettings = { ...defaultAppSettings };
  isGatewayOnline = true;
}
