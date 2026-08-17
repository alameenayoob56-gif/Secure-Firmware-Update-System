import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

// Attach JWT to protected API requests
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized API error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Backend is unreachable / network error
    if (!error.response) {
      return Promise.reject(
        new Error("Unable to connect to the backend service.")
      );
    }

    const { status } = error.response;

    // Unauthorized / expired JWT
    if (status === 401) {
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("user_role");

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }

      return Promise.reject(
        new Error("Your session has expired. Please log in again.")
      );
    }

    // Forbidden
    if (status === 403) {
      return Promise.reject(
        new Error("You do not have permission to perform this action.")
      );
    }

    // Resource not found
    if (status === 404) {
      return Promise.reject(
        new Error("The requested resource was not found.")
      );
    }

    // Validation error
    if (status === 422) {
      return Promise.reject(
        new Error("The submitted data is invalid. Please check your input.")
      );
    }

    // Rate limit
    if (status === 429) {
      return Promise.reject(
        new Error("Too many requests. Please wait and try again.")
      );
    }

    // Backend/server error
    if (status >= 500) {
      return Promise.reject(
        new Error("The backend service is currently unavailable.")
      );
    }

    // Any other unexpected HTTP error
    return Promise.reject(
      new Error("An unexpected error occurred. Please try again.")
    );
  }
);

export default api;