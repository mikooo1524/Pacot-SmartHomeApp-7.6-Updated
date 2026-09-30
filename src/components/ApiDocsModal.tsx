import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../context/IoTContext';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ApiDocsModal({ visible, onClose }: Props) {
  const { theme } = useIoT();

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/devices',
      desc: 'List all devices with optional ?room= and ?type= filters.',
    },
    {
      method: 'POST',
      path: '/api/v1/devices',
      desc: 'Register a new smart device. Body: { name, type, room, icon, powerUsage }',
    },
    {
      method: 'PUT',
      path: '/api/v1/devices/:id/status',
      desc: 'Toggle device state ON/OFF. Body: { status: boolean }',
    },
    {
      method: 'PATCH',
      path: '/api/v1/devices/:id',
      desc: 'Update device properties (brightness, speed, targetTemperature, name).',
    },
    {
      method: 'DELETE',
      path: '/api/v1/devices/:id',
      desc: 'Remove/unpair a device.',
    },
    {
      method: 'GET',
      path: '/api/v1/sensors/current',
      desc: 'Get telemetry (temperature, humidity, lightLevel, airQuality).',
    },
    {
      method: 'GET',
      path: '/api/v1/sensors/history',
      desc: 'Get 24-hour historical logs for trends.',
    },
    {
      method: 'POST',
      path: '/api/v1/scenes/:id/trigger',
      desc: 'Execute an automation scene.',
    },
    {
      method: 'POST',
      path: '/api/v1/gateway/connect',
      desc: 'Authenticate and handshake with the local IoT hub.',
    },
  ];

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET':
        return '#3B82F6';
      case 'POST':
        return '#10B981';
      case 'PUT':
      case 'PATCH':
        return '#F59E0B';
      case 'DELETE':
        return '#EF4444';
      default:
        return theme.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons
                name="code-working-outline"
                size={22}
                color={theme.primary}
              />
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                Backend Integration Specs
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Overview */}
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              ]}
            >
              <Text style={[styles.infoTitle, { color: theme.primary }]}>
                Ready for Backend / API Connection
              </Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                The frontend architecture strictly isolates UI from data logic in{' '}
                <Text style={{ fontWeight: '700' }}>src/services/IoTService.ts</Text> and{' '}
                <Text style={{ fontWeight: '700' }}>src/services/apiConfig.ts</Text>.
                To connect to a live server, set <Text style={{ fontWeight: '700' }}>USE_MOCK_API: false</Text> in apiConfig.ts.
              </Text>
            </View>

            {/* Endpoints List */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              REST API Endpoints Contract
            </Text>

            {endpoints.map((ep, idx) => (
              <View
                key={idx}
                style={[
                  styles.endpointCard,
                  {
                    backgroundColor: theme.surfaceSubdued,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.epHeader}>
                  <View
                    style={[
                      styles.methodBadge,
                      { backgroundColor: getMethodColor(ep.method) },
                    ]}
                  >
                    <Text style={styles.methodText}>{ep.method}</Text>
                  </View>
                  <Text
                    style={[styles.pathText, { color: theme.textPrimary }]}
                  >
                    {ep.path}
                  </Text>
                </View>
                <Text
                  style={[styles.epDesc, { color: theme.textSecondary }]}
                >
                  {ep.desc}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeModalBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.closeModalBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    maxWidth: 520,
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
  infoCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  endpointCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  epHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  pathText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  epDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  closeModalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
