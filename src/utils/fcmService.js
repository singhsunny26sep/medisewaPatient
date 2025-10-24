import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class FcmService {
  fcmToken = null;
  isTokenRequested = false;
  TOKEN_STORAGE_KEY = 'fcm_token';

  requestUserPermission = async () => {
    try {
      // Check if we have a stored token first
      const storedToken = await this.getStoredToken();
      if (storedToken) {
        console.log('✅ Using stored FCM token:', storedToken);
        this.fcmToken = storedToken;
        this.isTokenRequested = true;
        return storedToken;
      }
      if (this.isTokenRequested && this.fcmToken) {
        console.log('✅ Using cached FCM token:', this.fcmToken);
        return this.fcmToken;
      }
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      console.log('🔔 FCM Authorization status:', authStatus);
      if (enabled) {
        const token = await this.getFcmToken();
        return token;
      } else {
        console.log('❌ FCM Permission not granted');
        return null;
      }
    } catch (error) {
      console.log('FCM Permission Error:', error);
      return null;
    }
  };
  getFcmToken = async () => {
    try {
      if (!messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging().registerDeviceForRemoteMessages();
      }
      const token = await messaging().getToken();
      console.log('✅ FCM Token obtained:', token);
      this.fcmToken = token;
      this.isTokenRequested = true;
      // Store token for future use
      await this.storeToken(token);
      return token;
    } catch (error) {
      console.log('❌ Error getting FCM token:', error);
      // Fallback: try to get stored token
      const storedToken = await this.getStoredToken();
      if (storedToken) {
        console.log('🔄 Using fallback stored token');
        this.fcmToken = storedToken;
        return storedToken;
      }
      return null;
    }
  };
  // Store token in AsyncStorage
  storeToken = async (token) => {
    try {
      await AsyncStorage.setItem(this.TOKEN_STORAGE_KEY, token);
      console.log('💾 FCM Token stored successfully');
    } catch (error) {
      console.log('Error storing FCM token:', error);
    }
  };

  // Get stored token from AsyncStorage
  getStoredToken = async () => {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_STORAGE_KEY);
      return token;
    } catch (error) {
      console.log('Error getting stored FCM token:', error);
      return null;
    }
  };

  // Clear stored token
  clearStoredToken = async () => {
    try {
      await AsyncStorage.removeItem(this.TOKEN_STORAGE_KEY);
      console.log('🗑️ Stored FCM token cleared');
    } catch (error) {
      console.log('Error clearing stored FCM token:', error);
    }
  };

  getCurrentToken = () => {
    return this.fcmToken;
  };
  clearToken = () => {
    this.fcmToken = null;
    this.isTokenRequested = false;
    this.clearStoredToken();
  };
  hasToken = () => {
    return !!this.fcmToken;
  };
  // Setup token refresh listener
  setupTokenRefreshListener = () => {
    messaging().onTokenRefresh(async (newToken) => {
      console.log('🔄 FCM Token refreshed:', newToken);
      this.fcmToken = newToken;
      await this.storeToken(newToken);
      this.sendTokenToServer(newToken);
    });
  };
  // Send token to your backend server
  sendTokenToServer = async (token) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken && token) {
        console.log('📡 Sending FCM token to server...');
      }
    } catch (error) {
      console.log('Error sending token to server:', error);
    }
  };
  checkInitialNotification = async () => {
    const initialNotification = await messaging().getInitialNotification();

    if (initialNotification) {
      console.log('📱 Initial Notification:', initialNotification);
      this.handleNotification(initialNotification);
    }
  };
  handleNotification = (notification) => {
    console.log('📢 Received Notification:', notification);

    if (notification.data && notification.data.screen) {
      // Navigate to specific screen based on notification data
    }
  };
  // Initialize all FCM services
  initialize = async () => {
    try {
      console.log('🚀 Initializing FCM Service...');
      // Setup listeners
      this.setupTokenRefreshListener();
      // Check for initial notification
      await this.checkInitialNotification();
      // Get token if not available
      if (!this.fcmToken) {
        const storedToken = await this.getStoredToken();
        if (!storedToken) {
          await this.requestUserPermission();
        }
      }
      console.log('✅ FCM Service initialized successfully');
    } catch (error) {
      console.log('❌ FCM Service initialization error:', error);
    }
  };
}
export default new FcmService();