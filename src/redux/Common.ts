import AsyncStorage from '@react-native-async-storage/async-storage';
import strings from '../../localization';
import { actionTypes } from './ActionTypes';

const initialState = {
  userToken: '',
  userData: {},
  premiumData: [],
  language: 'en',
};

export default function (state = initialState, action: any) {
  switch (action.type) {
    case actionTypes.USER_DATA:
      return {...state, userData: action.payload};
    case actionTypes.PREMIUM_DATA:
      return {...state, premiumData: action.payload};
    case actionTypes.SET_LANGUAGE:
      strings.setLanguage(action.payload); 
      AsyncStorage.setItem('appLanguage', action.payload); // Persist in AsyncStorage
      return {...state, language: action.payload};
    default:
      return state;
  }
}
