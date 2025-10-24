import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { AgoraNotificationManager } from './AgoraNotificationHandler';

// Navigation ref for handling notification taps
let navigationRef = null;

export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

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
// Handle foreground messages
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
  } else {
    // Handle general notifications in foreground
    console.log('General notification in foreground:', remoteMessage);
    // You can show a toast or in-app notification here
    updateNotificationCount();
  }
});

// Handle background messages
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background remoteMessage:', remoteMessage);

  if (remoteMessage.data?.type === 'incoming_call') {
    // Background call handling is done by NotificationService
  } else {
    // For general notifications, the native service handles display
    // No additional action needed here
  }
});


// Handle initial notification when app is opened from terminated state
messaging()
  .getInitialNotification()
  .then((remoteMessage) => {
    if (remoteMessage) {
      console.log('Initial remoteMessage:', remoteMessage);
      handleNotificationTap(remoteMessage);
    }
  });

// Handle notification tap actions
messaging().onNotificationOpenedApp((remoteMessage) => {
  console.log('Notification opened app:', remoteMessage);
  handleNotificationTap(remoteMessage);
});

// Function to handle notification tap for navigation
function handleNotificationTap(remoteMessage) {
  const { data } = remoteMessage;

  if (data?.type === 'incoming_call') {
    const { callType, callId, callerName } = data;
    console.log('Notification tap for incoming call:', {
      callType, callId, callerName
    });

    // Navigate to appropriate call screen
    if (navigationRef) {
      if (callType === 'video') {
        navigationRef.navigate('VideoCall', {
          doctor: { name: callerName },
          callData: { callId }
        });
      } else {
        navigationRef.navigate('AudioCall', {
          doctor: { name: callerName },
          callData: { callId }
        });
      }
    }
  } else {
    // Handle general notifications
    const screen = data?.screen;
    if (screen && navigationRef) {
      console.log('Navigating to screen:', screen);
      navigationRef.navigate(screen, data);
    } else {
      console.log('No screen specified in notification data');
    }
  }
}
