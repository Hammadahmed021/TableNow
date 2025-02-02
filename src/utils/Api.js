import axios from "axios";
import { auth } from "../service/firebase";

const BASE_URL = "https://virtualrealitycreators.com/tablenow-backend/api/";
const API_KEY = import.meta.env.VITE_APP_KEY; // Ensure this is correctly set

export const getListDetails = async (url, params) => {
  try {
    const { data } = await axios.get(`${BASE_URL}${url}`, {
      params: {
        ...params,
        api_key: API_KEY,
      },
    });
    return data;
  } catch (error) {
    return error;
  }
};

export const Signup = async (userData) => {
  try {
    const { fname, token } = userData;
    const payload = {
      name: fname,
      token,
    };
    const response = await axios.post(`${BASE_URL}signup`, payload);
    return response.data;
  } catch (error) {
    console.error("Signup request failed:", error.response || error.message);
    throw error;
  }
};

export const Login = async (userData) => {
  try {
    const { token } = userData;
    const payload = { token };
    const response = await axios.post(`${BASE_URL}login`, payload);
    return response.data;
  } catch (error) {
    console.error("API Login request failed:", error.response);
    throw error;
  }
};
