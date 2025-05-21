import { combineReducers } from 'redux';
import CommonReducer from './Common';

const initialState = {
  language: 'en', // default language
  userData: null,
  premiumData: null
};

const rootReducer = combineReducers({
  Common: (state = initialState, action) => CommonReducer(state, action)
});

export default rootReducer; 