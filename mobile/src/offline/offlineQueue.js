import { getStorage, setStorage } from '../utils/storage';
import api from '../api/axios';

const QUEUE_KEY = 'offline_queue';

export const addToQueue = async (action) => {
  const queue = JSON.parse(await getStorage(QUEUE_KEY) || '[]');
  queue.push({ ...action, timestamp: Date.now() });
  await setStorage(QUEUE_KEY, JSON.stringify(queue));
};

export const processQueue = async () => {
  const queue = JSON.parse(await getStorage(QUEUE_KEY) || '[]');
  if (!queue.length) return;

  const failed = [];
  for (const item of queue) {
    try {
      await api({
        method: item.method,
        url: item.url,
        data: item.data,
      });
    } catch {
      failed.push(item);
    }
  }

  await setStorage(QUEUE_KEY, JSON.stringify(failed));
  return queue.length - failed.length;
};

export const getQueueCount = async () => {
  const queue = JSON.parse(await getStorage(QUEUE_KEY) || '[]');
  return queue.length;
};