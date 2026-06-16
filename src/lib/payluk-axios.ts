import axios, { type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './token-storage';

// Payluk calls go through our own backend proxy (`/api/v1/payluk/*`), which
// forwards to Payluk server-side. This avoids Payluk's CORS preflight rejection
// of browser-direct calls and keeps the Payluk secret key off the frontend.
// The proxy is protected, so we send the URA access token (not a Payluk secret).
const PAYLUK_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/payluk`;

const paylukAPI = axios.create({
  baseURL: PAYLUK_BASE_URL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    accept: 'application/json',
  },
});

// Attach the URA access token so the protected proxy route authorizes the call.
paylukAPI.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default paylukAPI;
