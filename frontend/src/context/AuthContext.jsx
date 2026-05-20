import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${apiUrl}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token, apiUrl]);

  const register = async (userData) => {
    try {
      const response = await axios.post(`${apiUrl}/auth/register`, userData);
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${apiUrl}/auth/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Update failed' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      register,
      login,
      logout,
      updateProfile,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
