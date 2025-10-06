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
      console.log('INITIATE_CALL: response summary:', {
        status: response?.status,
        success: response?.data?.success,
      });
      console.log('INITIATE_CALL: full response data:', response?.data);
      return response.data;
    } catch (error) {
      console.log('INITIATE_CALL: error:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
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