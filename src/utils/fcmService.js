import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

class Fcmservice {
  fcmToken = null;
  isTokenRequested = false;

  requestUserPermission = async () => {
    try {
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
        this.fcmToken = token;
        this.isTokenRequested = true;
        return token;
      }
      return null;
    } catch (error) {
      console.log('❌ FCM Permission Error:', error);
      return null;
    }
  };

  getFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('✅ FCM Token obtained:', token);
      
      this.fcmToken = token;
      this.isTokenRequested = true;
      
      return token;
    } catch (error) {
      console.log('❌ Error getting FCM token:', error);
      return null;
    }
  };

  getStoredToken = () => {
    return this.fcmToken;
  };

  clearToken = () => {
    this.fcmToken = null;
    this.isTokenRequested = false;
  };
  hasToken = () => {
    return !!this.fcmToken;
  };

  checkInitialNotification = async () => {
    const initialNotification = await messaging().getInitialNotification();
    
    if (initialNotification) {
      console.log('Initial Notification:', initialNotification);
      this.handleNotification(initialNotification);
    }
  };

  backgroundMessageHandler = () => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in background:', remoteMessage);
    });
  };

  handleNotification = (notification) => {
    console.log('Received Notification:', notification);
    
    if (notification.data && notification.data.screen) {
    }
  };
}

export default new Fcmservice();