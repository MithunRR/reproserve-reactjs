import axios from 'axios';

// Priority: window.API_BASE_URL (runtime override) → VITE_API_BASE_URL (.env.local)
// → '' (relative). With '' the dev Vite proxy forwards /api → local backend, and
// in prod the same-origin Express serves /api itself.
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && typeof window.API_BASE_URL === 'string') {
    return window.API_BASE_URL;
  }
  if (import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return '';
};

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;