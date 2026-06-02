import { useState } from 'react';
import { Alert } from 'react-native';

const useCamera = () => {
  const [hasPermission, setHasPermission] = useState(null);

  const requestPermission = async () => {
    try {
      const { Camera } = require('expo-camera');
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      return status === 'granted';
    } catch {
      Alert.alert('Camera permission required');
      return false;
    }
  };

  return { hasPermission, requestPermission };
};

export default useCamera;