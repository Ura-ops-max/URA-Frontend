import axios from 'axios';

// In dev, requests go through the Vite proxy (/payluk-api → VITE_PAYLUK_API_URL/v1)
// which avoids CORS preflight rejections from the Payluk staging server.
// In production you'll need a backend proxy that forwards to VITE_PAYLUK_API_URL/v1.
const PAYLUK_BASE_URL = import.meta.env.DEV
  ? '/payluk-api'
  : `${import.meta.env.VITE_PAYLUK_API_URL}/v1`;

const PAYLUK_SECRET_KEY = import.meta.env.VITE_PAYLUK_SECRET_KEY as string;

const paylukAPI = axios.create({
  baseURL: PAYLUK_BASE_URL,
  timeout: 10000,
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${PAYLUK_SECRET_KEY}`,
  },
});

export default paylukAPI;
