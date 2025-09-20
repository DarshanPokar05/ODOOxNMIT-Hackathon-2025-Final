import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  signup: (name: string, email: string, password: string, role?: string) => 
    api.post('/auth/signup', { name, email, password, role }),
  verifyOtp: (userId: string, otp: string) => 
    api.post('/auth/verify-otp', { userId, otp }),
  resendOtp: (userId: string) => 
    api.post('/auth/resend-otp', { userId }),
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  resetPassword: (userId: string, otp: string, newPassword: string) => 
    api.post('/auth/reset-password', { userId, otp, newPassword }),
};

export const dashboardAPI = {
  getKPIs: () => api.get('/dashboard/kpis'),
};

export const manufacturingOrdersAPI = {
  getAll: (filters?: any) => api.get('/manufacturing-orders', { params: filters }),
  create: (data: any) => api.post('/manufacturing-orders', data),
  updateStatus: (id: string, status: string) => 
    api.patch(`/manufacturing-orders/${id}/status`, { status }),
};

export const workCentersAPI = {
  getAll: () => api.get('/work-centers'),
};

export const workOrdersAPI = {
  getAll: (filters?: any) => api.get('/work-orders', { params: filters }),
  create: (data: any) => api.post('/work-orders', data),
  updateStatus: (id: string, status: string) => 
    api.patch(`/work-orders/${id}/status`, { status }),
};

export const productsAPI = {
  getAll: (filters?: any) => api.get('/products', { params: filters }),
  create: (data: any) => api.post('/products', data),
};

export default api;