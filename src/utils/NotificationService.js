import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { AgoraNotificationManager } from './AgoraNotificationHandler';

// Initialize Agora notification manager
AgoraNotificationManager.initialize().catch(console.error);

class NotificationService {
  navigationRef;

  constructor() {
    this.navigationRef = null;
  }

  setNavigationRef(navigation) {
    this.navigationRef = navigation;
  }

  async initialize() {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background call notification:', remoteMessage);
      await this.handleBackgroundCallNotification(remoteMessage);
    });

    // Handle notification opened app
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Initial notification:', remoteMessage);
          this.handleNotificationTap(remoteMessage);
        }
      });
  }

  async handleBackgroundCallNotification(remoteMessage) {
    const { data } = remoteMessage;
    if (data?.type === 'incoming_call') {
      console.log('Showing system notification for incoming call');

      // For React Native Firebase, we need to use native Android code
      // or handle this through Firebase console/server-side
      // The notification will be handled by the system automatically
    }
  }

  handleNotificationTap(remoteMessage) {
    const { data } = remoteMessage;

    if (data?.type === 'incoming_call') {
      const { callType, callId, callerName } = data;

      console.log('Handling call notification tap:', {
        callType, callId, callerName
      });

      // Navigate to appropriate call screen
      if (this.navigationRef) {
        if (callType === 'video') {
          this.navigationRef.navigate('VideoCall', {
            doctor: { name: callerName },
            callData: { callId }
          });
        } else {
          this.navigationRef.navigate('AudioCall', {
            doctor: { name: callerName },
            callData: { callId }
          });
        }
      }
    }
  }

  // Method to show incoming call notification (for server-side integration)
  
  getCallNotificationPayload(callData) {
    const { callId, callType, callerName, callerId } = callData;

    return {
      title: `Incoming ${callType === 'video' ? 'Video' : 'Audio'} Call`,
      body: `${callerName} is calling you`,
      click_action: 'INCOMING_CALL',
      icon: 'ic_notification_call',
      sound: 'default',
      priority: 'high',
      show_in_foreground: true,
      data: {
        callId,
        callType,
        callerName,
        callerId,
        type: 'incoming_call',
        channelId: 'incoming_calls',
      },
      android_channel_id: 'incoming_calls',
      // For full-screen intent on Android
      full_screen_intent: true,
      category: 'call',
      ongoing: true,
    };
  }

  // Method to show "message received" notification when call is received
  async showMessageReceivedNotification(callData) {
    const { callerName, callType } = callData;

    try {
      // Create a simple notification payload for Firebase
      const message = {
        notification: {
          title: 'Message Received',
          body: `${callerName} sent you a ${callType === 'video' ? 'video' : 'voice'} message`,
        },
        data: {
          type: 'message_received',
          callerName,
          callType,
          timestamp: new Date().toISOString(),
        },
        android: {
          channelId: 'message_notifications',
          priority: 'high',
          sound: 'default',
          icon: 'ic_notification_message',
          color: '#4CAF50',
        },
      };

      // For local notifications, we'll use the Firebase SDK to display it
      // This approach works for showing notifications when the app is in foreground/background
      await messaging().sendMessage(message);

      console.log('[NotificationService] Message received notification sent for:', callerName);
      return true;
    } catch (error) {
      console.log('[NotificationService] Error sending message received notification:', error);

      // Fallback: Show a simple console message
      console.log(`📱 Message Received: ${callerName} sent you a ${callType === 'video' ? 'video' : 'voice'} message`);
      return false;
    }
  }
}

// Singleton pattern
const notificationServiceInstance = new NotificationService();

export { notificationServiceInstance as notificationService };
