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


  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <View style={{flex: 1}}>
          <ToastProvider>
            {/* <LoginProvider> */}
              <NavigationScreen />
            {/* </LoginProvider> */}
          </ToastProvider>
        </View>
      </PersistGate>
    </Provider>
  );
}

export default App;