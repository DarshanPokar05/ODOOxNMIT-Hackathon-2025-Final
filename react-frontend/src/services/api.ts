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
  getShopFloor: () => api.get('/work-centers/shop-floor'),
  updateStatus: (id: string, status: string, isRunning: boolean) => 
    api.patch(`/work-centers/${id}/status`, { status, isRunning }),
};

export const workOrdersAPI = {
  getAll: (filters?: any) => api.get('/work-orders', { params: filters }),
  create: (data: any) => api.post('/work-orders', data),
  updateStatus: (id: string, status: string) => 
    api.patch(`/work-orders/${id}/status`, { status }),
};

export const billsOfMaterialAPI = {
  test: () => api.get('/bills-of-material/test'),
  getAll: (filters?: any) => api.get('/bills-of-material', { params: filters }),
  create: (data: any) => {
    console.log('API call to create BOM:', data);
    return api.post('/bills-of-material', data);
  },
  update: (id: string, data: any) => api.patch(`/bills-of-material/${id}`, data),
  delete: (id: string) => api.delete(`/bills-of-material/${id}`),
};

export const stockLedgerAPI = {
  getAll: (filters?: any) => api.get('/stock-ledger', { params: filters }),
  getCurrentStock: () => api.get('/stock-ledger/current-stock'),
  createEntry: (data: any) => api.post('/stock-ledger', data),
  getProductMovement: (productId: string) => api.get(`/stock-ledger/product/${productId}`),
};

export const qrCodeAPI = {
  getAll: (filters?: any) => api.get('/qr-codes', { params: filters }),
  generateWorkCenter: (id: string) => api.post(`/qr-codes/work-center/${id}`),
  generateWorkOrder: (id: string) => api.post(`/qr-codes/work-order/${id}`),
  scan: (code: string) => api.get(`/qr-codes/scan/${code}`),
  deactivate: (id: string) => api.patch(`/qr-codes/${id}/deactivate`),
};

export const productsAPI = {
  getAll: (filters?: any) => api.get('/products', { params: filters }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/alerts/low-stock'),
};

export const workOrdersEnhancedAPI = {
  ...workOrdersAPI,
  assign: (id: string, operatorId: string) => api.patch(`/work-orders/${id}/assign`, { operatorId }),
  reportIssue: (id: string, description: string) => api.post(`/work-orders/${id}/issue`, { description }),
  getAssigned: () => api.get('/work-orders/operator/assigned'),
  getByQR: (qrCode: string) => api.get(`/work-orders/qr/${qrCode}`),
};

export default api;