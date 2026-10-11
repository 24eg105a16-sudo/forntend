import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and broadcast logout if unauthorized
      const isAuthUrl = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const transactionApi = {
  getTransactions: (params) => api.get('/transactions', { params }),
  getTransactionById: (id) => api.get(`/transactions/${id}`),
  createTransaction: (data) => api.post('/transactions', data),
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getMonthlySummary: (months = 6) => api.get('/dashboard/monthly-summary', { params: { months } }),
  getCategoryBreakdown: (type, startDate, endDate) =>
    api.get('/dashboard/category-breakdown', { params: { type, startDate, endDate } }),
};

export const budgetApi = {
  getBudgets: (month) => api.get('/budgets', { params: { month } }),
  getBudgetById: (id) => api.get(`/budgets/${id}`),
  createBudget: (data) => api.post('/budgets', data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`),
};

export const reportApi = {
  getMonthlyReport: (months = 12) => api.get('/reports/monthly', { params: { months } }),
  getCategoryReport: (type, startDate, endDate) =>
    api.get('/reports/category', { params: { type, startDate, endDate } }),
  exportCsv: (params) =>
    api.get('/reports/export', {
      params,
      responseType: 'blob',
    }),
};

export default api;
