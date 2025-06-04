import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cartPersistConfig = {
  key: 'cart',
  storage: AsyncStorage,
  whitelist: ['cartCount', 'cartItems']
};

const cartInitialState = {
  cartCount: 0,
  cartItems: []
};

export const cartReducer = (state = cartInitialState, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return { 
        ...state, 
        cartCount: state.cartCount + 1,
        cartItems: [...state.cartItems, action.payload]
      };
    case 'REMOVE_FROM_CART':
      return { 
        ...state, 
        cartCount: Math.max(state.cartCount - 1, 0),
        cartItems: state.cartItems.filter(item => item.id !== action.payload)
      };
    case 'SET_CART_COUNT':
      return { 
        ...state, 
        cartCount: action.payload.count,
        cartItems: action.payload.items || state.cartItems
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cartCount: 0,
        cartItems: []
      };
    default:
      return state;
  }
};

const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

const rootReducer = combineReducers({
  cart: persistedCartReducer
});

const initialState = {
  cart: cartInitialState
};

export const store = createStore(rootReducer, initialState);
export const persistor = persistStore(store);
