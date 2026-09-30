import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useIoT } from '../context/IoTContext';

import DashboardScreen from './screens/DashboardScreen';
import SensorsScreen from './screens/SensorsScreen';
import DevicesScreen from './screens/DevicesScreen';
import SettingsScreen from './screens/SettingsScreen';
import CustomDrawerContent from './CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { theme } = useIoT();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
          shadowColor: theme.cardShadow,
          elevation: 2,
        },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        drawerActiveTintColor: theme.primary,
        drawerInactiveTintColor: theme.textSecondary,
        drawerActiveBackgroundColor: theme.primaryLight,
        drawerLabelStyle: {
          fontWeight: '600',
          fontSize: 14,
          marginLeft: -8,
        },
        drawerItemStyle: {
          borderRadius: 12,
          marginVertical: 4,
          paddingHorizontal: 6,
        },
        sceneStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Sensors"
        component={SensorsScreen}
        options={{
          title: 'Sensors',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Devices"
        component={DevicesScreen}
        options={{
          title: 'Devices',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="hardware-chip-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}