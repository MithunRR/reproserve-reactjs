import axios from 'axios';

// Always use relative URLs — the React build is served by the same Express
// app that serves /api, so the browser is on the same origin in production.
// In dev, Vite's proxy in vite.config.js forwards /api to the backend.
// Override via window.API_BASE_URL for one-off testing.
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && typeof window.API_BASE_URL === 'string') {
    return window.API_BASE_URL;
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