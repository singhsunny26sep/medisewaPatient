import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {StatusBar, View, StatusBarStyle, Platform, PermissionsAndroid} from 'react-native';
import {persistStore, persistReducer} from 'redux-persist';
import {Provider} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers, createStore} from 'redux';
import Common from './src/redux/Common';
import {PersistGate} from 'redux-persist/integration/react';
import strings from './localization';
import NavigationScreen from './src/routes/NavigationScreen';
import {ToastProvider} from 'react-native-toast-notifications';
import {cartReducer} from './Store/Store';
import LoginProvider from './src/context/LoginProvider';
import messaging from '@react-native-firebase/messaging';

function App(): React.JSX.Element {
  const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['language', 'cart'], 
  };

  const reducers = combineReducers({
    Common,
    cart: cartReducer
  });

  const persistedReducer = persistReducer(persistConfig, reducers);

  const store = createStore(persistedReducer);
  const persistor = persistStore(store);

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLang = await AsyncStorage.getItem("appLanguage");
      if (storedLang) {
        strings.setLanguage(storedLang)
      }
    };
    loadLanguage();
  }, []);

  // useEffect(() => {
  //   const requestNotificationPermissionAndroid = async () => {
  //     if (Platform.OS !== 'android') return true;
  //     // POST_NOTIFICATIONS is required for Android 13+
  //     try {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  //       );
  //       return granted === PermissionsAndroid.RESULTS.GRANTED;
  //     } catch (e) {
  //       return false;
  //     }
  //   };

  //   const requestPermissionIOS = async () => {
  //     if (Platform.OS !== 'ios') return true;
  //     const authStatus = await messaging().requestPermission();
  //     return (
  //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //       authStatus === messaging.AuthorizationStatus.PROVISIONAL
  //     );
  //   };

  //   const initFcm = async () => {
  //     const hasPerm = Platform.OS === 'android'
  //       ? await requestNotificationPermissionAndroid()
  //       : await requestPermissionIOS();
  //     if (!hasPerm) {
  //       console.log('[FCM] Notification permission not granted');
  //       return;
  //     }

  //     try {
  //       const token = await messaging().getToken();
  //       console.log('[FCM] Token:', token);
  //     } catch (err) {
  //       console.log('[FCM] Failed to get token', err);
  //     }

  //     const unsubscribe = messaging().onTokenRefresh(newToken => {
  //       console.log('[FCM] Token refreshed:', newToken);
  //     });

  //     return unsubscribe;
  //   };

  //   let unsubscribeRef: undefined | (() => void);
  //   initFcm().then(unsub => {
  //     if (typeof unsub === 'function') {
  //       unsubscribeRef = unsub;
  //     }
  //   });

  //   return () => {
  //     if (unsubscribeRef) unsubscribeRef();
  //   };
  // }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <View style={{flex: 1}}>
          <ToastProvider>
            <LoginProvider>
              <NavigationScreen />
            </LoginProvider>
          </ToastProvider>
        </View>
      </PersistGate>
    </Provider>
  );
}

export default App;