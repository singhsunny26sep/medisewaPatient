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
  try {
    console.log('Fetching Agora token for channel:', channelName, 'uid:', uid);
    const res = await Instance.get(
      `/calls/agora-token?channel=${encodeURIComponent(channelName)}&uid=${encodeURIComponent(
        String(uid),
      )}`,
    );
    console.log('Agora token response:', res.data);
    return res.data?.token;
  } catch (error) {
    console.error('Error fetching Agora token:', error);
    console.error('Response data:', error.response?.data);
    console.error('Response status:', error.response?.status);
    throw error;
  }
};

export {Instance};
