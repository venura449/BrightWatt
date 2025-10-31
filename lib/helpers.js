// helpers.js
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get LAN IP from debuggerHost in Expo
const debuggerHost = Constants.manifest?.debuggerHost || Constants.expoConfig?.hostUri;
const lanIP = debuggerHost?.split(':').shift(); // Extract "192.168.x.x"

export const getBackendUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:9000';
  }
  // Use LAN IP if available, else fallback
  return lanIP ? `http://${lanIP}:9000` : 'http://192.168.1.15:9000';
};
