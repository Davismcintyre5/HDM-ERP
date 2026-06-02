import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

const usePushNotifications = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;
    const { data } = await Notifications.getExpoPushTokenAsync();
    setToken(data);
  };

  return { token };
};

export default usePushNotifications;