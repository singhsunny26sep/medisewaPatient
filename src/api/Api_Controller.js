import { Instance } from "./Instance";

export const GET_HEALTH_ESSENTIALS = async (page = 1, limit = 20) => {
    try {
      const response = await Instance.get(
        `/api/v1/categories/pagination?page=${page}&limit=${limit}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  export const INITIATE_CALL = async ({ recieverId, callType }) => {
    try {
      const url = `/api/v1/calls/initiate`;
      const payload = { recieverId, callType };
      console.log('INITIATE_CALL: request ->', { url, payload });
      const response = await Instance.post(url, payload);
      console.log('INITIATE_CALL: response Summary:', {
        status: response?.status,
        success: response?.data?.success,
        hasCallId: !!(response?.data?.callId || response?.data?.data?.callId),
      });
      // Log FULL response for debugging
      console.log('INITIATE_CALL: FULL RESPONSE:', JSON.stringify(response.data, null, 2));
      const callId = response?.data?.callId || response?.data?.data?.callId;
      console.log('INITIATE_CALL: callId:', callId);
      return response.data;
    } catch (error) {
      console.log('INITIATE_CALL: error:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      // Check for FCM token issues
      if (error.response?.data?.error?.code === 'messaging/invalid-payload') {
        console.warn('🚨 BACKEND FCM ERROR: Recipient FCM token missing or invalid!');
        console.warn('The call may still exist - check backend logs.');
      }
      throw error;
    }
  };

  // Update FCM token on server
  export const UPDATE_FCM_TOKEN = async (fcmToken) => {
    try {
      const url = `/api/v1/users/update-fcm-token`;
      const payload = { fcmToken };
      console.log('UPDATE_FCM_TOKEN: request ->', { url });
      const response = await Instance.post(url, payload);
      console.log('UPDATE_FCM_TOKEN: response:', response?.data);
      return response.data;
    } catch (error) {
      console.log('UPDATE_FCM_TOKEN: error:', error?.response?.data);
      throw error;
    }
  };

  export const ACCEPT_CALL = async (callId) => {
    try {
      const url = `/api/v1/calls/accept`;
      const payload = { callId };
      console.log('ACCEPT_CALL: request ->', { url, payload });
      const response = await Instance.put(url, payload);
      console.log('ACCEPT_CALL: response summary:', {
        status: response?.status,
        success: response?.data?.success,
      });
      console.log('ACCEPT_CALL: full response data:', response?.data);
      return response.data;
    } catch (error) {
      console.log('ACCEPT_CALL: error:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  };

  export const END_CALL = async (callId) => {
    try {
      const url = `/api/v1/calls/end`;
      const payload = { callId };
      console.log('END_CALL: request ->', { url, payload });
      const response = await Instance.post(url, payload);
      console.log('END_CALL: response summary:', {
        status: response?.status,
        success: response?.data?.success,
      });
      console.log('END_CALL: full response data:', response?.data);
      return response.data;
    } catch (error) {
      console.log('END_CALL: error:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  };
  
  export const GET_OFFER_MEDICINES = async (page = 1, limit = 10) => {
    try {
      const response = await Instance.get(
        `/api/v1/medicines/pagination?page=${page}&limit=${limit}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const GET_OFFERSDATA = async (page = 1, limit = 10) => {
    try {
      const response = await Instance.get(
        `/api/v1/offers/pagination?page=${page}&limit=${limit}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  export const GET_BRANDS = async (page = 1, limit = 10) => {
    try {
      const response = await Instance.get(
        `/api/v1/brands/pagination?page=${page}&limit=${limit}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  export const ADD_TO_CART = async (payload, token) => {
    try {
      const response = await Instance.post(
        '/api/v1/medicineCarts/addToCart',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

export const GET_CART_DATA = async token => {
    try {
      const response = await Instance.get('api/v1/medicineCarts/getCart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
export const DELETE_CART_ITEM = async (cartItemId, token) => {
    try {
      const response = await Instance.delete(
        `api/v1/medicineCarts/removeFromCart/${cartItemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

export const ADD_MONEY_TO_WALLET = async amount => {
    try {
      const response = await Instance.post('/wallet/recharge', { amount });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

export const VERIFY_WALLET_PAYMENT = async payload => {
    try {
      const response = await Instance.post('/wallet/recharge/verify', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

export const GET_WALLET_BALANCE = async () => {
    try {
      const response = await Instance.get('/wallet/balance');
      return response.data;
    } catch (error) {
      throw error;
    }
  };
