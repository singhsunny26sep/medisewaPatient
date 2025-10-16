import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { AgoraNotificationManager } from './AgoraNotificationHandler';

export async function requestUserPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      getFCMToken();
    } else {
      console.log('Permission Denied');
    }
  } else {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log('Authorization status:', authStatus);
      getFCMToken();
    }
  }
}

// Handle incoming call notifications
export const handleIncomingCallNotification = (remoteMessage) => {
  console.log('Incoming call notification:', remoteMessage);

  const { data } = remoteMessage;
  const callType = data?.callType || 'video';
  const callerName = data?.callerName || 'Unknown Doctor';
  const callId = data?.callId;

  if (!callId) {
    console.log('No callId in notification data');
    return;
  }

  // Show high priority notification for incoming calls
  const notification = {
    title: `Incoming ${callType === 'video' ? 'Video' : 'Audio'} Call`,
    body: `${callerName} is calling you`,
    android: {
      channelId: 'incoming_calls',
      priority: 'high',
      importance: 'high',
      visibility: 'public',
      category: 'call',
      fullScreenIntent: true,
      actions: [
        {
          title: 'Accept',
          pressAction: {
            id: 'accept_call',
            launchActivity: 'default',
          },
        },
        {
          title: 'Decline',
          pressAction: {
            id: 'decline_call',
            launchActivity: 'default',
          },
        },
      ],
    },
    data: {
      callId,
      callType,
      callerName,
      channel: 'incoming_call',
      type: 'incoming_call',
    },
  };

  return notification;
};

async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    // Store token in AsyncStorage if needed
    // await AsyncStorage.setItem('fcmToken', token);
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
}

function updateNotificationCount() {
  // Implement notification count update logic
  console.log('Updating notification count');
  // You can implement this based on your app's notification handling logic
}
messaging().onMessage(async (remoteMessage) => {
  console.log('Foreground remoteMessage:', remoteMessage);

  // Handle incoming call notifications in foreground
  if (remoteMessage.data?.type === 'incoming_call') {
    const callNotification = handleIncomingCallNotification(remoteMessage);
    if (callNotification) {
      // Show in-app call notification overlay
      // The CallInviteHandler will handle this through RTM
      console.log('Incoming call in foreground - should show in-app overlay');
    }
  }

  updateNotificationCount();
});

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background remoteMessage:', remoteMessage);

  // Handle incoming call notifications in background
  if (remoteMessage.data?.type === 'incoming_call') {
    const callNotification = handleIncomingCallNotification(remoteMessage);
    if (callNotification) {
      // Show system notification for incoming call
      await messaging().createNotificationChannel({
        id: 'incoming_calls',
        name: 'Incoming Calls',
        description: 'Notifications for incoming video and audio calls',
        importance: messaging.AndroidChannelImportance.HIGH,
        vibrationPattern: [0, 1000, 500, 1000],
        lightColor: '#4CAF50',
      });

      // Display the notification
      await messaging().displayNotification(callNotification);
    }
  }

  updateNotificationCount();
});

messaging()
  .getInitialNotification()
  .then((remoteMessage) => {
    if (remoteMessage) {
      console.log('Initial remoteMessage:', remoteMessage);

      // Handle notification tap when app is opened from terminated state
      if (remoteMessage.data?.type === 'incoming_call') {
        const { callType, callId, callerName } = remoteMessage.data;
        console.log('App opened from terminated state for incoming call:', {
          callType, callId, callerName
        });

        // Navigate to appropriate call screen or show call UI
        // This should be handled in the main app component
      }
    }
  });

// Handle notification tap actions
messaging().onNotificationOpenedApp((remoteMessage) => {
  console.log('Notification opened app:', remoteMessage);

  if (remoteMessage.data?.type === 'incoming_call') {
    const { callType, callId, callerName } = remoteMessage.data;
    console.log('Notification tap for incoming call:', {
      callType, callId, callerName
    });

    // Handle notification tap for incoming calls
    // Navigate to call screen or show call UI
  }
});
