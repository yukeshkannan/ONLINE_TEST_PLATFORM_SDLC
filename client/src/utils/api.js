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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAuthToken = async () => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const response = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
  const newAccessToken = response.data?.accessToken;
  if (newAccessToken) {
    setAccessToken(newAccessToken);
    return newAccessToken;
  } else {
    setAccessToken('');
    window.dispatchEvent(new Event('auth-expired'));
    throw new Error('No access token in refresh response');
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
      if (isRefreshing) {
        try {
          const newToken = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          config.headers.Authorization = `Bearer ${newToken}`;
          return config;
        } catch (err) {
          return Promise.reject(err);
        }
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshAuthToken();
        processQueue(null, newAccessToken);
      } catch (refreshError) {
        processQueue(refreshError, null);
      } finally {
        isRefreshing = false;
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
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAuthToken();
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

