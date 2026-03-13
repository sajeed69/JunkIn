import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('junkin_token'));
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
        } catch (err) {
            // Only clear credentials on explicit 401 (invalid/expired token)
            // Do NOT clear on network errors (backend down, timeout, etc.)
            if (err.response?.status === 401) {
                localStorage.removeItem('junkin_token');
                setToken(null);
                setUser(null);
            }
            // For network errors, keep the token but set user to null
            // User can still navigate public pages; auth will retry on next load
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const login = async (credentials) => {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('junkin_token', data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        return data.user;
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        toast.success('Registration successful! Please verify your OTP.');
        return data;
    };

    const verifyOtp = async (payload) => {
        const { data } = await api.post('/auth/verify-otp', payload);
        localStorage.setItem('junkin_token', data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success('Verified successfully!');
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('junkin_token');
        setToken(null);
        setUser(null);
        toast.success('Logged out successfully.');
    };

    const updateUser = (updatedUser) => setUser((prev) => ({ ...prev, ...updatedUser }));

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, logout, register, verifyOtp, updateUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
