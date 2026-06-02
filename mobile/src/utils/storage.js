import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStorage = async (key) => {
  try { return await AsyncStorage.getItem(key); } catch { return null; }
};

export const setStorage = async (key, value) => {
  try { await AsyncStorage.setItem(key, value); } catch {}
};

export const removeStorage = async (key) => {
  try { await AsyncStorage.removeItem(key); } catch {}
};

export const clearAll = async () => {
  try { await AsyncStorage.clear(); } catch {}
};