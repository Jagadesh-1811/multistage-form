import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useUI } from './UIContext';

const AuthContext = createContext(null);

// Configure global Axios request interceptor to attach bearer token
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { showToast } = useUI();

  // Validate session on mount or refresh
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          if (response.data && response.data.success) {
            setUser(response.data.user);
          } else {
            sessionStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          sessionStorage.removeItem('auth_token');
        }
      }
      setLoadingAuth(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data && response.data.success) {
        const { token, user: userData } = response.data;
        sessionStorage.setItem('auth_token', token);
        setUser(userData);
        showToast('Logged in successfully!', 'success');
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/signup', { name, email, password });
      if (response.data && response.data.success) {
        const { token, user: userData } = response.data;
        sessionStorage.setItem('auth_token', token);
        setUser(userData);
        showToast('Account created successfully!', 'success');
        return { success: true };
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errMsg = error.response?.data?.message || 'Signup failed. Please try again.';
      showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error on backend:', error);
    } finally {
      sessionStorage.removeItem('auth_token');
      setUser(null);
      showToast('Logged out successfully.', 'success');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loadingAuth, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
