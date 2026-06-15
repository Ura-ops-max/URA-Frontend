import type { CustomError } from '@/types/custom-error.type';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './token-storage';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const options = {
  baseURL,
  withCredentials: true,
  timeout: 10000,
};

// 1. Define public paths that shouldn't trigger a redirect
const PUBLIC_PATHS = ['/', '/about', '/contact'];

const API = axios.create(options);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to attach token
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling and token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        ...error,
        errorCode: 'NETWORK_ERROR',
      });
    }

    const { data, status } = error.response;

    const isAuthRequest =
      originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register');

    if (status === 401 && isAuthRequest) {
      return Promise.reject(error); // This lets your LoginPage handle the error
    }
    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue subsequent requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      // 2. Inside the 401 handler:
      if (!refreshToken) {
        tokenStorage.clearTokens();

        // Only redirect if they aren't already on a public page
        const isPublicPage = PUBLIC_PATHS.includes(window.location.pathname);
        const isAuthPage = window.location.pathname.startsWith('/auth'); // Add this check

        // 💥 UPDATE REDIRECT LOGIC 💥
        if (!isPublicPage && !isAuthPage) {
          window.location.href = '/auth/login';
        }

        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true },
        );

        // Handle nested data structure from backend
        const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;

        tokenStorage.setToken(accessToken);
        if (newRefreshToken) {
          tokenStorage.setRefreshToken(newRefreshToken);
        }

        processQueue(null, accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clearTokens();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const customError: CustomError = {
      ...error,
      errorCode: data?.errorCode || 'UNKNOWN_ERROR',
    };

    return Promise.reject(customError);
  },
);

export default API;
