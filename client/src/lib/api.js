import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export const authApi = {
  me: () => api.get('/auth/me').then(r => r.data),
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  signup: (data) => api.post('/auth/signup', data).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  refresh: () => api.post('/auth/refresh').then(r => r.data),
};

export const reportsApi = {
  list: (params) => api.get('/reports', { params }).then(r => r.data),
  get: (id) => api.get(`/reports/${id}`).then(r => r.data),
  createText: (text) => api.post('/reports', { sourceType: 'text', text }).then(r => r.data),
  createImage: (file) => {
    const fd = new FormData();
    fd.append('sourceType', 'image');
    fd.append('image', file);
    return api.post('/reports', fd).then(r => r.data);
  },
  uploadPdf: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/reports/pdf', fd).then(r => r.data);
  },
};

export const summariesApi = {
  generate: (reportId) => api.post(`/summaries/${reportId}`).then(r => r.data),
};
