// src/api/api.ts
import axios, { type AxiosInstance, AxiosError } from 'axios';
// import notify from '../utils/notify';

let getAccessToken = () => null; // default

export const setAccessTokenGetter = (getter: any) => {
  getAccessToken = getter;
};

const api: AxiosInstance = axios.create({
  baseURL: window.location.href.includes('localhost:5173') ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'https://stage.b2bees.com'),
  timeout: 20000 // 20 seconds
});

// Add Authorization header from localStorage
api.interceptors.request.use(config => {

  const token = getAccessToken();

  if (config.url?.includes('{version}')) {
    config.url = config.url.replace('{version}', '1.0');
  }

  if (config.url?.includes('portal/')) {
    config.url = config.url.replace('portal/', '');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Global 401 handler
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {

    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    if (error.response?.status === 403) {
      // Handle 403 Forbidden error
      //notify.error('Access forbidden. Please check your permissions.');
      return Promise.reject(new Error('Access forbidden'));
    }

    if (error.response?.status === 500) {
    //   notify.error('Internal server error. Please try again later.');
      return Promise.reject(new Error('Internal server error'));
    }

    if (error.response?.status === 502 || error.response?.status === 504 || error.response?.status === 503 || error.response?.status === 429) {
    //   notify.error('Server under maintenance. Please contact support.');
      return Promise.reject(new Error('Server under maintenance'));
    }

    return Promise.reject(error);
  }
);

export default api;

