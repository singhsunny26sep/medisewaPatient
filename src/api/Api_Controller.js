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