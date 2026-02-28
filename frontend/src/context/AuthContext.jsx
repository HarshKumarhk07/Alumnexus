import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (storedUser && token) {
                // Set initial state for immediate render
                setUser(JSON.parse(storedUser));

                // Verify with backend
                try {
                    const res = await authService.getMe();
                    // getMe returns { success: true, data: user }
                    // However, our code above was using res.data.data assuming axios returns res.data which contains the full object
                    setUser(res.data.data);
                    localStorage.setItem('user', JSON.stringify(res.data.data));
                } catch (error) {
                    console.error("Token verification failed:", error);
                    // The API service interceptor will handle clearing local storage on 401,
                    // but we should clear the state here just in case.
                    setUser(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        verifyUser();
    }, []);

    const login = async (credentials) => {
        const data = await authService.login(credentials);
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        const data = await authService.register(userData);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
