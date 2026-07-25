import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
    getPublicBranches: () => api.get('/auth/branches')
};

// Branch API
export const branchAPI = {
    getAll: () => api.get('/branches'),
    getOne: (id) => api.get(`/branches/${id}`),
    create: (data) => api.post('/branches', data),
    update: (id, data) => api.put(`/branches/${id}`, data),
    delete: (id) => api.delete(`/branches/${id}`)
};

// Salesman API
export const salesmanAPI = {
    getAll: (params) => api.get('/salesmen', { params }),
    getOne: (id) => api.get(`/salesmen/${id}`),
    create: (data) => api.post('/salesmen', data),
    update: (id, data) => api.put(`/salesmen/${id}`, data),
    resetPassword: (id, data) => api.put(`/salesmen/${id}/reset-password`, data),
    toggleStatus: (id) => api.put(`/salesmen/${id}/toggle-status`)
};

// Sales API
export const salesAPI = {
    addSale: (data) => api.post('/sales', data),
    getMySales: (params) => api.get('/sales/my', { params }),
    deleteSale: (id) => api.delete(`/sales/${id}`),
    getAll: (params) => api.get('/sales/all', { params }),
    getDashboard: () => api.get('/sales/dashboard'),
    getDailyReport: (params) => api.get('/sales/daily-report', { params }),
    getMonthlyReport: (params) => api.get('/sales/monthly-report', { params }),
    getSalesmanPerformance: (params) => api.get('/sales/salesman-performance', { params }),
    getBranchReport: (params) => api.get('/sales/branch-report', { params })
};

export default api;
