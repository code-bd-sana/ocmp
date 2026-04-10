import axios from "axios";
import { AuthAction } from "@/service/auth";
import { normalizeApiErrorPayload } from "@/service/shared/subscription-access";

// Create an axios instance that automatically attaches the auth token if available
export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config) => {
    const token = AuthAction.GetAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    normalizeApiErrorPayload(error?.response?.data);
    return Promise.reject(error);
  },
);
