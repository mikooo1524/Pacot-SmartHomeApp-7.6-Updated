import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../context/IoTContext';

export default function CustomDrawerContent(props: any) {
  const {
    theme,
    isDarkMode,
    toggleTheme,
    gatewayConnected,
    appSettings,
    devices,
    activeDeviceCount,
  } = useIoT();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.surface },
      ]}
      style={{ backgroundColor: theme.surface }}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons
            name="hardware-chip"
            size={34}
            color={theme.primary}
          />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {appSettings.homeName || 'IoT Home'}
        </Text>

        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Smart Environment Control
        </Text>

        {/* Gateway Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: gatewayConnected
                ? theme.successLight
                : theme.dangerLight,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: gatewayConnected
                  ? theme.success
                  : theme.danger,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: gatewayConnected
                  ? theme.success
                  : theme.danger,
              },
            ]}
          >
            {gatewayConnected ? 'Gateway Online' : 'Gateway Offline'}
          </Text>
        </View>

        {/* Mini stats summary */}
        <View style={[styles.miniStatsRow, { backgroundColor: theme.surfaceSubdued }]}>
          <View style={styles.miniStatItem}>
            <Text style={[styles.miniStatVal, { color: theme.textPrimary }]}>
              {devices.length}
            </Text>
            <Text style={[styles.miniStatLabel, { color: theme.textSecondary }]}>
              Devices
            </Text>
          </View>
          <View style={[styles.miniStatDivider, { backgroundColor: theme.border }]} />
          <View style={styles.miniStatItem}>
            <Text style={[styles.miniStatVal, { color: theme.primary }]}>
              {activeDeviceCount}
            </Text>
            <Text style={[styles.miniStatLabel, { color: theme.textSecondary }]}>
              Active
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation Items */}
      <View style={styles.menu}>
        <DrawerItemList {...props} />
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.themeToggleBtn,
            { backgroundColor: theme.surfaceSubdued, borderColor: theme.border },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
            size={18}
            color={theme.primary}
          />
          <Text style={[styles.themeToggleText, { color: theme.textPrimary }]}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.textMuted }]}>
          Smart Home App v1.0.0
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  miniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 8,
    borderRadius: 12,
  },
  miniStatItem: {
    alignItems: 'center',
  },
  miniStatVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  miniStatLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  miniStatDivider: {
    width: 1,
    height: 20,
  },
  menu: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 11,
  },
});