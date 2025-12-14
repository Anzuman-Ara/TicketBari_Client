import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: import.meta.env.VITE_API_TIMEOUT || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      // Skip redirect for payment-related endpoints to allow graceful error handling
      if (!error.config.url.includes('/payments/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.');
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else if (error.code === 'ERR_NETWORK') {
      // Handle network errors, including CORS issues
      if (error.message.includes('Network Error')) {
        toast.error('Unable to connect to the server. Please check your internet connection or try again later.');
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Firebase authentication
  firebaseLogin: (idToken) => api.post('/auth/firebase/login', { idToken }),
  firebaseRegister: (idToken, role = 'user') => api.post('/auth/firebase/register', { idToken, role }),
  getCurrentUser: () => api.get('/auth/firebase/me'),
  updateProfile: (userData) => api.put('/auth/firebase/update-profile', userData),
  
  // Traditional authentication (fallback)
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
};

export { api as default };
export { api };