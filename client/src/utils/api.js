import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

let accessToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';

export const setAccessToken = (token) => {
  accessToken = token || '';
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAccessToken = () => accessToken;

const isTokenExpired = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now() + 10000;
  } catch (error) {
    return true;
  }
};

api.interceptors.request.use(
  async (config) => {
    if (
      accessToken && 
      isTokenExpired(accessToken) && 
      config.url && 
      !config.url.includes('/auth/refresh') &&
      !config.url.includes('/auth/admin/login') &&
      !config.url.includes('/auth/student/login')
    ) {
      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = response.data?.accessToken;
        if (newAccessToken) {
          accessToken = newAccessToken;
        }
      } catch (refreshError) {
        accessToken = '';
        window.dispatchEvent(new Event('auth-expired'));
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/admin/login') &&
      !originalRequest.url.includes('/auth/student/login')
    ) {
      originalRequest._retry = true;
      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = response.data?.accessToken;

        if (!newAccessToken) {
          setAccessToken('');
          window.dispatchEvent(new Event('auth-expired'));
          return Promise.reject(new Error('Session expired. Please login again.'));
        }

        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken('');
        window.dispatchEvent(new Event('auth-expired'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

