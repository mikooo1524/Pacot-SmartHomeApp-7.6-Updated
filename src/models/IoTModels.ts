import { Ionicons } from '@expo/vector-icons';

export type DeviceType =
  | 'Smart Light'
  | 'Smart Fan'
  | 'Smart Lock'
  | 'Thermostat'
  | 'Smart Plug'
  | 'Security Camera'
  | 'Smart Speaker'
  | 'Air Conditioner';

export type Device = {
  id: number;
  name: string;
  type: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: boolean;
  room?: string;
  brightness?: number; // 0-100% for lights
  speed?: number; // 1-5 for fans
  targetTemperature?: number; // °C for thermostats
  powerUsage?: number; // Watts
  batteryLevel?: number; // 0-100%
  isFavorite?: boolean;
  lastUpdated?: string;
};

export type SensorData = {
  temperature: number;
  humidity: number;
  lightLevel: number;
  airQuality?: number; // AQI (0-500)
  motionDetected?: boolean;
  noiseLevel?: number; // dB
  lastUpdated?: string;
};

export type SensorHistoryPoint = {
  timestamp: string;
  temperature: number;
  humidity: number;
  lightLevel: number;
  airQuality: number;
};

export type ActivityLog = {
  id: string;
  timestamp: string;
  deviceName: string;
  action: string;
  type: 'info' | 'warning' | 'error' | 'success';
};

export type AutomationScene = {
  id: number;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  isActive: boolean;
  actionSummary: string;
};

export type GatewayConfig = {
  host: string;
  port: number;
  protocol: 'MQTT' | 'HTTP/REST' | 'WebSocket';
  apiKey: string;
  autoReconnect: boolean;
  pollIntervalSeconds: number;
  ssl: boolean;
};

export type GatewayStatus = {
  connected: boolean;
  ip: string;
  uptime: string;
  latency: number;
  connectedClients: number;
  lastPing: string;
};

export type AppSettings = {
  notifications: boolean;
  autoConnect: boolean;
  darkMode: boolean;
  temperatureUnit: 'C' | 'F';
  homeName: string;
  energyCostPerKwh: number;
};

export const ROOM_OPTIONS = [
  'All',
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Front Door',
  'Office',
  'Balcony',
  'Garage',
];

export const DEVICE_TYPE_OPTIONS: Array<{
  type: DeviceType;
  defaultIcon: keyof typeof Ionicons.glyphMap;
}> = [
  { type: 'Smart Light', defaultIcon: 'bulb-outline' },
  { type: 'Smart Fan', defaultIcon: 'sync-outline' },
  { type: 'Smart Lock', defaultIcon: 'lock-closed-outline' },
  { type: 'Thermostat', defaultIcon: 'thermometer-outline' },
  { type: 'Smart Plug', defaultIcon: 'power-outline' },
  { type: 'Security Camera', defaultIcon: 'videocam-outline' },
  { type: 'Smart Speaker', defaultIcon: 'volume-high-outline' },
  { type: 'Air Conditioner', defaultIcon: 'snow-outline' },
];

export const sampleDevices: Device[] = [
  {
    id: 1,
    name: 'Living Room Light',
    type: 'Smart Light',
    icon: 'bulb-outline',
    status: true,
    room: 'Living Room',
    brightness: 80,
    powerUsage: 12,
    isFavorite: true,
    lastUpdated: 'Just now',
  },
  {
    id: 2,
    name: 'Bedroom Fan',
    type: 'Smart Fan',
    icon: 'sync-outline',
    status: false,
    room: 'Bedroom',
    speed: 2,
    powerUsage: 45,
    isFavorite: true,
    lastUpdated: '5 mins ago',
  },
  {
    id: 3,
    name: 'Front Door Lock',
    type: 'Smart Lock',
    icon: 'lock-closed-outline',
    status: true,
    room: 'Front Door',
    batteryLevel: 92,
    isFavorite: true,
    lastUpdated: '12 mins ago',
  },
  {
    id: 4,
    name: 'Kitchen Ambient LED',
    type: 'Smart Light',
    icon: 'bulb-outline',
    status: false,
    room: 'Kitchen',
    brightness: 50,
    powerUsage: 18,
    isFavorite: false,
    lastUpdated: '1 hour ago',
  },
  {
    id: 5,
    name: 'Main AC Thermostat',
    type: 'Thermostat',
    icon: 'snow-outline',
    status: true,
    room: 'Living Room',
    targetTemperature: 23,
    powerUsage: 1200,
    isFavorite: true,
    lastUpdated: 'Just now',
  },
  {
    id: 6,
    name: 'Office Smart Plug',
    type: 'Smart Plug',
    icon: 'power-outline',
    status: true,
    room: 'Office',
    powerUsage: 85,
    isFavorite: false,
    lastUpdated: '2 hours ago',
  },
];

export const initialSensorData: SensorData = {
  temperature: 28,
  humidity: 65,
  lightLevel: 720,
  airQuality: 42,
  motionDetected: false,
  noiseLevel: 38,
  lastUpdated: 'Live',
};

export const sampleSensorHistory: SensorHistoryPoint[] = [
  { timestamp: '06:00', temperature: 24, humidity: 72, lightLevel: 120, airQuality: 28 },
  { timestamp: '09:00', temperature: 26, humidity: 68, lightLevel: 550, airQuality: 35 },
  { timestamp: '12:00', temperature: 31, humidity: 60, lightLevel: 920, airQuality: 48 },
  { timestamp: '15:00', temperature: 32, humidity: 58, lightLevel: 880, airQuality: 52 },
  { timestamp: '18:00', temperature: 29, humidity: 64, lightLevel: 610, airQuality: 45 },
  { timestamp: '21:00', temperature: 27, humidity: 66, lightLevel: 250, airQuality: 40 },
  { timestamp: 'Now', temperature: 28, humidity: 65, lightLevel: 720, airQuality: 42 },
];

export const sampleScenes: AutomationScene[] = [
  {
    id: 1,
    name: 'Arrive Home',
    icon: 'home-outline',
    description: 'Turns on living room light, sets AC to 23°C, and unlocks front door.',
    isActive: true,
    actionSummary: '3 devices triggered',
  },
  {
    id: 2,
    name: 'Good Night',
    icon: 'moon-outline',
    description: 'Turns off all lights, locks doors, and turns on bedroom fan.',
    isActive: false,
    actionSummary: '5 devices triggered',
  },
  {
    id: 3,
    name: 'Movie Night',
    icon: 'film-outline',
    description: 'Dims living room light to 20% and sets cozy temperature.',
    isActive: false,
    actionSummary: '2 devices triggered',
  },
  {
    id: 4,
    name: 'Energy Saver',
    icon: 'leaf-outline',
    description: 'Turns off unused plugs and optimizes thermostat power consumption.',
    isActive: false,
    actionSummary: 'All inactive devices off',
  },
];

export const sampleActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2 mins ago',
    deviceName: 'Living Room Light',
    action: 'Status changed to ON',
    type: 'success',
  },
  {
    id: 'log-2',
    timestamp: '18 mins ago',
    deviceName: 'Front Door Lock',
    action: 'Unlocked via App',
    type: 'info',
  },
  {
    id: 'log-3',
    timestamp: '45 mins ago',
    deviceName: 'IoT Gateway',
    action: 'Synced 6 connected devices',
    type: 'info',
  },
  {
    id: 'log-4',
    timestamp: '2 hours ago',
    deviceName: 'Main AC Thermostat',
    action: 'Target temp adjusted to 23°C',
    type: 'info',
  },
];

export const defaultGatewayConfig: GatewayConfig = {
  host: '192.168.1.100',
  port: 8080,
  protocol: 'HTTP/REST',
  apiKey: 'iot_gateway_key_98f4a2',
  autoReconnect: true,
  pollIntervalSeconds: 5,
  ssl: false,
};

export const defaultAppSettings: AppSettings = {
  notifications: true,
  autoConnect: true,
  darkMode: false,
  temperatureUnit: 'C',
  homeName: 'My Smart Home',
  energyCostPerKwh: 0.14,
};
