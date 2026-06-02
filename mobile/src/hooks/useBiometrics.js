import { useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

const useBiometrics = () => {
  const [available, setAvailable] = useState(false);

  const checkAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setAvailable(compatible && enrolled);
    return compatible && enrolled;
  };

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access HDM ERP',
      fallbackLabel: 'Use password',
    });
    return result.success;
  };

  return { available, checkAvailability, authenticate };
};

export default useBiometrics;