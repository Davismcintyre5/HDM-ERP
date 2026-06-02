import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'offline_cache_';

export const cacheData = async (key, data, ttlMinutes = 30) => {
  const payload = {
    data,
    expiry: Date.now() + ttlMinutes * 60 * 1000,
  };
  await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
};

export const getCachedData = async (key) => {
  const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
  if (!cached) return null;
  const { data, expiry } = JSON.parse(cached);
  if (Date.now() > expiry) {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
    return null;
  }
  return data;
};

export const clearCache = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
  await AsyncStorage.multiRemove(cacheKeys);
};