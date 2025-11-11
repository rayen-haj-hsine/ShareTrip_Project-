import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: BASE_URL,
});

// ✅ Axios interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Add this function
export function toNumber(n: number | string | undefined): number {
  if (typeof n === 'number') return n;
  const x = Number(n);
  return Number.isNaN(x) ? 0 : x;
}