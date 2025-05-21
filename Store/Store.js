// store.js
import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cartPersistConfig = {
  key: 'cart',
  storage: AsyncStorage,
  whitelist: ['cartCount']
};

const cartInitialState = {
  cartCount: 0,
};

const cartReducer = (state = cartInitialState, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return { ...state, cartCount: state.cartCount + 1 };
    case 'REMOVE_FROM_CART':
      return { ...state, cartCount: Math.max(state.cartCount - 1, 0) };
    case 'SET_CART_COUNT':
      return { ...state, cartCount: action.payload };
    default:
      return state;
  }
};

const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

// Create root reducer with initial state
const rootReducer = combineReducers({
  cart: persistedCartReducer
});

// Create store with initial state
const initialState = {
  cart: cartInitialState
};

export const store = createStore(rootReducer, initialState);
export const persistor = persistStore(store);
