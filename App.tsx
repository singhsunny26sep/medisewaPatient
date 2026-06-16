import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { persistStore, persistReducer } from 'redux-persist';
import { Provider } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, createStore } from 'redux';
import Common from './src/redux/Common';
import { PersistGate } from 'redux-persist/integration/react';
import strings from './localization';
import NavigationScreen from './src/routes/NavigationScreen';
import { ToastProvider } from 'react-native-toast-notifications';
import { cartReducer } from './Store/Store';
import LoginProvider from './src/context/LoginProvider';
import { StatusBarProvider } from './src/utils/StatusBarContext';
import { requestUserPermission } from './src/utils/Firebase';
import { notificationService } from './src/utils/NotificationService';
import { AgoraNotificationManager } from './src/utils/AgoraNotificationHandler';
import CallProvider, { setCallNavigationRef } from './src/utils/CallProvider';

function App(): React.JSX.Element {
  const navigationRef = useRef(null);

  const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['language', 'cart'],
  };

  const reducers = combineReducers({
    Common,
    cart: cartReducer,
  });

  const persistedReducer = persistReducer(persistConfig, reducers);

  const store = createStore(persistedReducer);
  const persistor = persistStore(store);

  useEffect(() => {
    const initializeApp = async () => {
      // Load language settings
      const storedLang = await AsyncStorage.getItem('appLanguage');
      if (storedLang) {
        strings.setLanguage(storedLang);
      }

      // Request notification permissions and initialize notification services
      await requestUserPermission();
      notificationService.initialize();
      notificationService.setNavigationRef(navigationRef.current);

      // Initialize Agora notification manager
      AgoraNotificationManager.setNavigationRef(navigationRef.current);

      // Initialize call manager (for handling call states)
      setCallNavigationRef(navigationRef.current);
      console.log('Call manager initialized');
    };

    initializeApp();
  }, []);

  // Handle notification intent when app opens
  useEffect(() => {
    const checkInitialNotification = async () => {
      const intentData = await AgoraNotificationManager.checkNotificationIntent();
      if (intentData && intentData.action === 'ACCEPT_CALL_FROM_NOTIFICATION') {
        const { callId, callType, callerName } = intentData;
        const nav = navigationRef.current;
        if (nav && callId) {
          setTimeout(() => {
            nav.navigate(
              callType === 'video' ? 'VideoCall' : 'AudioCall',
              {
                doctor: { name: callerName },
                callData: { callId },
                callAccepted: true,
                fromNotification: true,
              },
            );
          }, 1000);
        }
      }
    };
    checkInitialNotification();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <View style={styles.container}>
          <ToastProvider>
            <LoginProvider>
              <StatusBarProvider>
                <CallProvider>
                  <NavigationScreen ref={navigationRef} />
                </CallProvider>
              </StatusBarProvider>
            </LoginProvider>
          </ToastProvider>
        </View>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
