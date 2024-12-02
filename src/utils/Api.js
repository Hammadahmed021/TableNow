import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_KEY = import.meta.env.VITE_APP_KEY; // Ensure this is correctly set
// const TOKEN = "CUso6eFZl1LmPsUGrFMKf15tcS5FElsqOoWXBbtj2PUxRAI5HTVuxOPZyLmL";

export const getListDetails = async (url, user_id) => {
  try {
    // const fullUrl = user_id
    //   ? `${BASE_URL}${url}/${user_id}`
    //   : `${BASE_URL}${url}`;
    // console.log(fullUrl, user_id, "fullUrl");

    const { data } = await axios.get(`${BASE_URL}${url}/${user_id}`, {
      params: {
        // ...params,
        api_key: API_KEY,
      },
      // have to delete this one
      // headers: {
      //   Authorization: `Bearer ${TOKEN}`, // Send the token in the Authorization header
      // },
      // signal
    });
    return data;
  } catch (error) {
    return error;
  }
};

export const dataForFilter = async (url) => {
  try {
    const { data } = await axios.get(`${BASE_URL}${url}`, {
      params: {
        api_key: API_KEY,
      },
    });
    return data;
  } catch (error) {
    throw new Error(error.message || "unable to find filters");
  }
};

export const Signup = async (userData) => {
  try {
    const { email, fname, password, phone } = userData;
    const payload = {
      name: fname,
      email,
      password,
      phone,
      type: "user",
    };

    const response = await axios.post(`${BASE_URL}signup`, payload);
    console.log(response, "response");

    return response.data;
  } catch (error) {
    console.error("Signup request failed:", error.response || error.message);
    throw error;
  }
};

export const Login = async (userData) => {
  console.log(userData, "userData");
  try {
    const { email, fname, password, fcm_token } = userData;
    const payload = {
      // name: fname,
      email,
      password,
      type: "user",
      fcm_token,
    };
    console.log(payload, "payload");

    const response = await axios.post(`${BASE_URL}login`, payload);
    console.log(response, "payload login");

    return response.data;
  } catch (error) {
    console.error("API Login request failed:", error.response);
    throw error;
  }
};

// Function to fetch filtered data
export const fetchFilteredData = async (filters) => {
  try {
    const response = await axios.post(`${BASE_URL}filter`, filters, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data; // Adjust based on actual response structure
  } catch (error) {
    console.error("Error fetching filtered data:", error);
    throw error;
  }
};

// Function to fetch bookings data

export const fetchBookings = async (booking) => {
  const token = localStorage.getItem("webToken");
  const tokenCheck = localStorage.getItem("signToken");
  const authToken = tokenCheck || token;

  try {
    const response = await axios.post(
      `${BASE_URL}save-table-booking`,
      booking,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request data:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

// Functions to fetch payment stripe payment intent
export const getPayment = async (paymentData) => {
  console.log("Booking object before API call:", paymentData);
  try {
    const response = await axios.post(
      `${BASE_URL}create-payment-intent`,
      paymentData
    );
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request data:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

// Function to show all user bookings
export const getUserBookings = async (params) => {
  const token = localStorage.getItem("webToken");
  const tokenCheck = localStorage.getItem("signToken");
  const authToken = token || tokenCheck;

  try {
    const { data } = await axios.get(`${BASE_URL}getUserBookings`, {
      params: {
        ...params,
        api_key: API_KEY,
      },

      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    return error;
  }
};

// Function to delete user booking
export const deleteUserBooking = async (booking_id) => {
  const token = localStorage.getItem("webToken");
  const tokenCheck = localStorage.getItem("signToken");
  const authToken = token || tokenCheck;

  try {
    const { data } = await axios.put(
      `${BASE_URL}updateUserBookingStatus/${booking_id}`,
      null,
      {
        params: {
          // ...params,
          api_key: API_KEY,
        },
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    return error;
  }
};

// Function to delete all user bookings
export const deleteAllUserBookings = async () => {
  const token = localStorage.getItem("webToken");
  const tokenCheck = localStorage.getItem("signToken");
  const authToken = token || tokenCheck;

  try {
    const { data } = await axios.put(
      `${BASE_URL}updateUserAllBookingsStatus`,
      null,
      {
        params: {
          // ...params,
          api_key: API_KEY,
        },
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    return error;
  }
};

// Function to update user profile
export const updateUserProfile = async (userData) => {
  const token = localStorage.getItem("webToken");
  const tokenCheck = localStorage.getItem("signToken");
  const authToken = token || tokenCheck;

  const { name, phone, profile_image, user_id } = userData;
  console.log(userData, "userData api");

  // Create FormData object
  const formData = new FormData();
  formData.append("user_id", user_id);
  formData.append("name", name);
  formData.append("phone", phone);

  // Append the profile image only if it's present
  if (profile_image) {
    formData.append("profile_image", profile_image);
  }

  // Log the FormData content as a JSON object
  console.log(Object.fromEntries(formData), "form data from api");

  try {
    const data = await axios.post(`${BASE_URL}update-profile`, formData, {
      params: {
        api_key: API_KEY,
      },
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(data.data.user, "data for api");

    return data;
  } catch (error) {
    console.log("Error in updating user profile: ", error);
    throw new Error("Error in updating user profile");
  }
};

export const verifyToken = async (Btoken) => {
  console.log(Btoken, "Btoken api");
  try {
    const data = await axios.get(`${BASE_URL}verify-token/${Btoken}`, {});
    localStorage.setItem("signToken", data.data.token);
    // Retrieve the token from localStorage

    return data;
  } catch (error) {
    console.log("Error in updating user profile: ", error);
    throw new Error("Error in updating user profile");
  }
};

// Function to verify if user is logged In or not
export const verifyUser = async (token) => {
  const tokenCheck = localStorage.getItem("signToken");
  const tokenCheck2 = localStorage.getItem("webToken");
  const authToken = token || tokenCheck || tokenCheck2;
  console.log(authToken, "authToken");
  if (authToken) {
    try {
      const data = await axios.get(`${BASE_URL}verify`, {
        params: {
          api_key: API_KEY,
        },
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log(data.data, "data for user profile");

      return data;
    } catch (error) {
      console.log("Error in updating user profile: ", error);
      throw new Error("Error in updating user profile");
    }
  } else {
    console.log("unable to get  token");
  }
};

// Function to get user from gmail to login
export const getUserFromGmailLogin = async (email) => {
  // const { email } = userData;
  const payload = {
    email,
  };
  try {
    const response = await axios.post(`${BASE_URL}socialLogin`, payload);
    console.log(response.data, "response");

    return response;
  } catch (error) {
    console.log(error, "error getting user from gmail");

    throw new Error("something went wrong");
  }
};

// Function to get user from gmail to signup
export const getUserFromGmailSignup = async (userData) => {
  const { email, name } = userData;
  const payload = {
    name,
    email,
  };
  try {
    const response = await axios.post(`${BASE_URL}socialSignup`, payload);
    console.log(response, "response");

    return response;
  } catch (error) {
    console.log(error, "error getting user from gmail");

    throw new Error("something went wrong");
  }
};

/* Favorites */
export const addFavorite = async (hotel_id) => {
  const token = localStorage.getItem("webToken");
  const tokenCheck = localStorage.getItem("signToken");
  const authToken = token || tokenCheck;

  try {
    const response = await axios.post(
      `${BASE_URL}favorite`,
      { hotel_id },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log(response, "response add favorite");

    return response.data;
  } catch (error) {
    throw new Error("unable to add favorites:", error?.message);
  }
};

export const showFavorite = async () => {
  const token = localStorage.getItem("webToken");
  const tokenCheck = localStorage.getItem("signToken");
  const authToken = token || tokenCheck;

  try {
    const response = await axios.get(`${BASE_URL}user-favorites`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response, "response show list of favorite");

    return response.data;
  } catch (error) {
    throw new Error("unable to add favorites:", error?.message);
  }
};

/* Rate */
export const giveRateToHotel = async (rateData) => {
  const token = localStorage.getItem("webToken");
  const tokenCheck = localStorage.getItem("signToken");
  const authToken = token || tokenCheck;
  const { table_booking_id, hotel_id, user_id, rating, review } = rateData;
  try {
    const response = await axios.post(`${BASE_URL}rate`, rateData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "unable to give ratings");
  }
};

export const sendFCMToken = async (fcm_token) => {
  console.log(fcm_token, "fcm_token");
  try {
    const data = await axios.post(`${BASE_URL}add-fcm-token`, fcm_token);
    return data.data;
  } catch (error) {
    throw new Error(error.message || "unable to find filters");
  }
};
export const getHotelByID = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}hotel/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error | "unable to fetch hotel by id");
  }
};

// Function to show near by hotels if user allow location
export const fetchUserNearByRestaurants = async ({ payload }) => {
  const { id, latitude, longitude, page } = payload;
  console.log(id, latitude, longitude, "id, latitude, longitude");
  try {
    const response = await axios.post(`${BASE_URL}nearby-hotels`, {
      id,
      latitude,
      longitude,
      page,
    });
    console.log(response, "nearby restaurant");
    return response.data;
  } catch (error) {
    throw new Error(error || "unable to fetch nearby restaurants");
  }
};

/* Send newsletter */

export const sendNewsletter = async (newsEmail) => {
  const email = newsEmail.email;
  console.log(newsEmail, "email api newsletter");
  try {
    const response = await axios.get(
      `${BASE_URL}subscribe-newsletter/${email}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.message || "unale to send newsletter");
  }
};

// Delete account

export const deleteAccount = async () => {
  const tokenCheck = localStorage.getItem("signToken");
  const tokenCheck2 = localStorage.getItem("webToken");
  const authToken =  tokenCheck || tokenCheck2;
  try {
    const response = await axios.delete(`${BASE_URL}delete-acc`,{
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "unale to send newsletter");
  }
};
