import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

const useOffline = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable !== false);
    });
    return () => unsubscribe();
  }, []);

  return { isOnline };
};

export default useOffline;