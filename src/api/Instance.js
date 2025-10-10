import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Instance = axios.create({
  // baseURL: 'https://pathology-server.onrender.com/',
  // baseURL: 'http://192.168.115.164:5000/',
  baseURL: 'https://medisawabackend.onrender.com/',
});

Instance.interceptors.request.use(
  async config => {
    try { 
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
    }
    return config;
  },
  error => Promise.reject(error),
);

export const fetchAgoraToken = async (channelName, uid) => {
  const res = await Instance.get(
    `/calls/agora-token?channel=${encodeURIComponent(channelName)}&uid=${encodeURIComponent(
      String(uid),
    )}`,
  );
  return res.data?.token;
};

export {Instance};
