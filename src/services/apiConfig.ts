/**
 * API Configuration and Backend Integration Layer
 * 
 * To connect to a live backend:
 * 1. Change USE_MOCK_API to false.
 * 2. Set API_BASE_URL to your backend API server (e.g. 'http://192.168.1.100:3000/api' or 'https://api.smarthome.example.com').
 * 3. Provide an authToken if authentication is required.
 */

export const API_CONFIG = {
  // Toggle this flag to false when connecting to a real backend
  USE_MOCK_API: true,

  // Base URL for backend REST API endpoints
  API_BASE_URL: 'http://192.168.1.100:8080/api/v1',

  // WebSocket / MQTT broker endpoint for real-time sensor & device streams
  STREAM_URL: 'ws://192.168.1.100:8080/ws',

  // Request timeout in milliseconds
  TIMEOUT_MS: 8000,

  // Simulated latency for mock data in milliseconds (helps demonstrate loading states)
  MOCK_DELAY_MS: 800,

  // Simulated failure rate (0 to 1) for mock API resilience testing (set to 0 for stable demo)
  SIMULATED_FAILURE_RATE: 0.05,

  // Endpoints map
  ENDPOINTS: {
    DEVICES: '/devices',
    DEVICE_DETAIL: (id: number) => `/devices/${id}`,
    DEVICE_STATUS: (id: number) => `/devices/${id}/status`,
    SENSORS_CURRENT: '/sensors/current',
    SENSORS_HISTORY: '/sensors/history',
    GATEWAY_STATUS: '/gateway/status',
    GATEWAY_CONNECT: '/gateway/connect',
    GATEWAY_DISCONNECT: '/gateway/disconnect',
    GATEWAY_CONFIG: '/gateway/config',
    SCENES: '/scenes',
    SCENE_TRIGGER: (id: number) => `/scenes/${id}/trigger`,
    ACTIVITY_LOGS: '/activity-logs',
    SETTINGS: '/settings',
  },
};

/**
 * Generic API client helper for making HTTP requests to a real backend.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.API_BASE_URL}${endpoint}`;
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody.message || `API Error: ${response.status} ${response.statusText}`
      );
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your network or gateway connection.');
    }
    throw error;
  }
}
