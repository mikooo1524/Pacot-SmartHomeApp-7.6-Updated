import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import { IoTProvider, useIoT } from './src/context/IoTContext';

function MainApp() {
  const { isDarkMode } = useIoT();

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <IoTProvider>
      <MainApp />
    </IoTProvider>
  );
}