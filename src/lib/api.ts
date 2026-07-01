import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import tokenStorage from './tokenStorage';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = tokenStorage.get('refreshToken');
        if (!refreshToken) throw new Error('no refresh token');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        tokenStorage.set('accessToken', data.data.accessToken);
        tokenStorage.set('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        tokenStorage.remove('accessToken');
        tokenStorage.remove('refreshToken');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
