import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const AUTH_ENDPOINTS = ["/auth/refresh", "/auth/login", "/auth/logout"];
const api: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, // pass through 2xx as-is

  async (error) => {
    const originalRequest: InternalAxiosRequestConfig & { _retry?: boolean } =
      error.config;

    // we did this to send our actual error message from backend instead of the axios error message
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    if (
      AUTH_ENDPOINTS.some((endpoint) => originalRequest.url?.includes(endpoint))
    ) {
      return Promise.reject(error);
    }

    // if the 401 came FROM /auth/refresh itself → don't retry, just reject
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // not a 401, or already retried — just reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // if a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // refresh token is in the httpOnly cookie, sent automatically
      await api.post("/auth/refresh");

      processQueue(null); // unblock queued requests
      return api(originalRequest); // retry the original call
    } catch (refreshError) {
      // if (axios.isAxiosError(refreshError)) {
      //   console.log(
      //     "refresh failed:",
      //     refreshError.response?.status,
      //     refreshError.response?.data,
      //   );
      // }
      processQueue(refreshError); // reject all queued requests

      // refresh token expired or missing — kick to login
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
