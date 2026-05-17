import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lp_token');
      localStorage.removeItem('lp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  googleLogin: (data) => api.post('/api/auth/google', data),
  me: () => api.get('/api/auth/me'),
};

// ── LEADS ─────────────────────────────────────────────────────
export const leadsAPI = {
  getAll: (params) => api.get('/api/leads', { params }),
  getById: (id) => api.get(`/api/leads/${id}`),
  upload: (formData) =>
    api.post('/api/leads/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/api/leads/${id}`, data),
  delete: (id) => api.delete(`/api/leads/${id}`),
  bulkDelete: (ids) => api.post('/api/leads/bulk-delete', { ids }),
  updateStatus: (id, status) => api.patch(`/api/leads/${id}/status`, { status }),
  export: (params) =>
    api.get('/api/leads/export', { params, responseType: 'blob' }),
};

// ── MESSAGES ──────────────────────────────────────────────────
export const messagesAPI = {
  generate: (data) => api.post('/api/messages/generate', data),
  getTemplates: () => api.get('/api/messages/templates'),
  saveTemplate: (data) => api.post('/api/messages/templates', data),
};

// ── ANALYTICS ─────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard'),
  getOutreach: (range) => api.get('/api/analytics/outreach', { params: { range } }),
  getConversions: () => api.get('/api/analytics/conversions'),
};

// ── FILES ─────────────────────────────────────────────────────
export const filesAPI = {
  getAll: () => api.get('/api/files'),
  delete: (id) => api.delete(`/api/files/${id}`),
};

// ── CAMPAIGNS ─────────────────────────────────────────────────
export const campaignsAPI = {
  getAll: () => api.get('/api/campaigns'),
  create: (data) => api.post('/api/campaigns', data),
  update: (id, data) => api.put(`/api/campaigns/${id}`, data),
};

export default api;
