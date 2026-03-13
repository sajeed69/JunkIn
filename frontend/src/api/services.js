import api from './axios';

export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    verifyOtp: (data) => api.post('/auth/verify-otp', data),
    getMe: () => api.get('/auth/me'),
};

export const listingService = {
    create: (formData) =>
        api.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getAll: (params) => api.get('/listings', { params }),
    getMine: () => api.get('/listings/my-listings'),
    getById: (id) => api.get(`/listings/${id}`),
    update: (id, data) => api.put(`/listings/${id}`, data),
    convertToScrap: (id) => api.put(`/listings/${id}/convert-to-scrap`),
    expressInterest: (id) => api.post(`/listings/${id}/interest`),
    markSold: (id, buyerId) => api.put(`/listings/${id}/mark-sold`, { buyerId }),
};

export const scrapService = {
    schedule: (data) => api.post('/scrap/schedule', data),
    getMine: () => api.get('/scrap/my-pickups'),
    getById: (id) => api.get(`/scrap/${id}`),
    updateWeight: (id, data) => api.put(`/scrap/${id}/weight`, data),
    getReceipt: (id) => api.get(`/scrap/${id}/receipt`),
};

export const kabadiwalaService = {
    getRequests: () => api.get('/kabadiwala/requests'),
    accept: (id) => api.put(`/kabadiwala/requests/${id}/accept`),
    reject: (id) => api.put(`/kabadiwala/requests/${id}/reject`),
    getActive: () => api.get('/kabadiwala/active'),
    completePickup: (id, data) => api.put(`/kabadiwala/pickups/${id}/complete`, data),
    getEarnings: () => api.get('/kabadiwala/earnings'),
    getRatings: () => api.get('/kabadiwala/ratings'),
    getBulkRequests: () => api.get('/kabadiwala/bulk-requests'),
};

export const adminService = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    banUser: (id) => api.put(`/admin/users/${id}/ban`),
    approveKabadiwala: (id) => api.put(`/admin/users/${id}/approve`),
    getTransactions: (params) => api.get('/admin/transactions', { params }),
    updateConfig: (data) => api.put('/admin/config', data),
    getConfig: () => api.get('/admin/config'),
    getScrapRates: () => api.get('/admin/scrap-rates'),
    updateScrapRates: (data) => api.put('/admin/scrap-rates', data),
};

export const aiService = {
    analyze: (data) => api.post('/ai/analyze', data),
    predictResale: (data) => api.post('/ai/predict-resale', data),
    classifyScrap: (formData) =>
        api.post('/ai/classify-scrap', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
