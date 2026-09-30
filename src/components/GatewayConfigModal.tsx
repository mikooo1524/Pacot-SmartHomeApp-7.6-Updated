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
import { GatewayConfig } from '../models/IoTModels';
import { useIoT } from '../context/IoTContext';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function GatewayConfigModal({ visible, onClose }: Props) {
  const {
    theme,
    gatewayConfig,
    saveGatewayConfig,
    connectGateway,
    gatewayConnecting,
  } = useIoT();

  const [host, setHost] = useState(gatewayConfig.host);
  const [port, setPort] = useState(String(gatewayConfig.port));
  const [protocol, setProtocol] = useState<'MQTT' | 'HTTP/REST' | 'WebSocket'>(
    gatewayConfig.protocol
  );
  const [apiKey, setApiKey] = useState(gatewayConfig.apiKey);
  const [autoReconnect, setAutoReconnect] = useState(
    gatewayConfig.autoReconnect
  );
  const [ssl, setSsl] = useState(gatewayConfig.ssl);
  const [pollInterval, setPollInterval] = useState(
    String(gatewayConfig.pollIntervalSeconds)
  );

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setHost(gatewayConfig.host);
      setPort(String(gatewayConfig.port));
      setProtocol(gatewayConfig.protocol);
      setApiKey(gatewayConfig.apiKey);
      setAutoReconnect(gatewayConfig.autoReconnect);
      setSsl(gatewayConfig.ssl);
      setPollInterval(String(gatewayConfig.pollIntervalSeconds));
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [visible, gatewayConfig]);

  const handleSaveAndTest = async () => {
    if (!host.trim()) {
      setErrorMsg('Gateway Host/IP is required.');
      return;
    }
    const parsedPort = parseInt(port, 10);
    if (isNaN(parsedPort) || parsedPort <= 0) {
      setErrorMsg('Valid port number is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updatedConfig: GatewayConfig = {
        host: host.trim(),
        port: parsedPort,
        protocol,
        apiKey: apiKey.trim(),
        autoReconnect,
        ssl,
        pollIntervalSeconds: parseInt(pollInterval, 10) || 5,
      };

      await saveGatewayConfig(updatedConfig);
      await connectGateway(updatedConfig);

      setSuccessMsg('Gateway configuration saved & connected successfully!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to gateway.');
    } finally {
      setSaving(false);
    }
  };

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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons
                name="server-outline"
                size={22}
                color={theme.primary}
              />
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                Gateway Configuration
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {!!errorMsg && (
              <View
                style={[
                  styles.alertBox,
                  {
                    backgroundColor: theme.dangerLight,
                    borderColor: theme.danger,
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={18} color={theme.danger} />
                <Text style={[styles.alertText, { color: theme.danger }]}>
                  {errorMsg}
                </Text>
              </View>
            )}

            {!!successMsg && (
              <View
                style={[
                  styles.alertBox,
                  {
                    backgroundColor: theme.successLight,
                    borderColor: theme.success,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={theme.success}
                />
                <Text style={[styles.alertText, { color: theme.success }]}>
                  {successMsg}
                </Text>
              </View>
            )}

            {/* Protocol */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Communication Protocol
              </Text>
              <View style={styles.protocolRow}>
                {(['HTTP/REST', 'MQTT', 'WebSocket'] as const).map((proto) => {
                  const isSelected = protocol === proto;
                  return (
                    <TouchableOpacity
                      key={proto}
                      onPress={() => setProtocol(proto)}
                      style={[
                        styles.protoBtn,
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
                          styles.protoText,
                          {
                            color: isSelected ? '#FFFFFF' : theme.textPrimary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {proto}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Host & Port */}
            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 2, marginRight: 10 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Host / IP Address *
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
                  placeholder="192.168.1.100"
                  placeholderTextColor={theme.textMuted}
                  value={host}
                  onChangeText={setHost}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Port *
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
                  placeholder="8080"
                  keyboardType="numeric"
                  placeholderTextColor={theme.textMuted}
                  value={port}
                  onChangeText={setPort}
                />
              </View>
            </View>

            {/* API Key */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                API Key / Auth Token
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
                placeholder="Bearer token or API key"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
                value={apiKey}
                onChangeText={setApiKey}
              />
            </View>

            {/* Poll Interval */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Telemetry Poll Interval (Seconds)
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
                placeholder="5"
                placeholderTextColor={theme.textMuted}
                value={pollInterval}
                onChangeText={setPollInterval}
              />
            </View>

            {/* SSL / TLS */}
            <View
              style={[
                styles.switchRow,
                {
                  backgroundColor: theme.surfaceSubdued,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.switchTextCol}>
                <Text style={[styles.switchTitle, { color: theme.textPrimary }]}>
                  Enable SSL / TLS Encryption
                </Text>
                <Text style={[styles.switchSub, { color: theme.textMuted }]}>
                  Use secure HTTPS/WSS/MQTTS connection
                </Text>
              </View>
              <Switch
                value={ssl}
                trackColor={{
                  false: theme.switchTrackInactive,
                  true: theme.primary,
                }}
                thumbColor={'#FFFFFF'}
                onValueChange={setSsl}
              />
            </View>

            {/* Auto Reconnect */}
            <View
              style={[
                styles.switchRow,
                {
                  backgroundColor: theme.surfaceSubdued,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.switchTextCol}>
                <Text style={[styles.switchTitle, { color: theme.textPrimary }]}>
                  Auto-Reconnect
                </Text>
                <Text style={[styles.switchSub, { color: theme.textMuted }]}>
                  Reconnect automatically if socket drops
                </Text>
              </View>
              <Switch
                value={autoReconnect}
                trackColor={{
                  false: theme.switchTrackInactive,
                  true: theme.primary,
                }}
                thumbColor={'#FFFFFF'}
                onValueChange={setAutoReconnect}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={onClose}
              disabled={saving}
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
              onPress={handleSaveAndTest}
              disabled={saving || gatewayConnecting}
              style={[
                styles.saveBtn,
                { backgroundColor: theme.primary },
                (saving || gatewayConnecting) && styles.btnDisabled,
              ]}
            >
              {saving || gatewayConnecting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="link-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save & Test Connection</Text>
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
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  protocolRow: {
    flexDirection: 'row',
    gap: 8,
  },
  protoBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  protoText: {
    fontSize: 13,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  switchTextCol: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchSub: {
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
    paddingHorizontal: 18,
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
