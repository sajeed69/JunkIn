import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000, // 20s to allow time for Gemini AI analysis
});

// Request interceptor — attach JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('junkin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401
// IMPORTANT: Only redirect on explicit 401 from auth endpoints.
// Do NOT redirect for network errors or non-auth API failures.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect on explicit 401 from auth endpoints.
        // Do NOT redirect for network errors (error.response is undefined)
        if (
            error.response?.status === 401 &&
            error.config?.url?.includes('/auth/')
        ) {
            localStorage.removeItem('junkin_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
