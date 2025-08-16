import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

// Add axios interceptor to include auth token
axios.interceptors.request.use(
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

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(null);

  // Fetch user and profile status on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/me'); // Adjust if your endpoint is different
        setUser(res.data);
        setIsAuthenticated(true);
        await refreshProfileStatus();
      } catch {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setProfileComplete(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Function to refresh profile status (call after profile update)
  const refreshProfileStatus = async () => {
    try {
      const res = await axios.get('/api/users/profile/status');
      setProfileComplete(res.data.isComplete);
    } catch {
      setProfileComplete(false);
    }
  };

  // Example login function
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      setUser(user);
      setIsAuthenticated(true);
      await refreshProfileStatus();
      return { success: true, message: 'Login successful' };
    } catch (err) {
      setIsAuthenticated(false);
      setProfileComplete(false);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Example logout function
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear token from localStorage
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setProfileComplete(null);
  };

  const register = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', credentials);
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      setUser(user);
      setIsAuthenticated(true);
      await refreshProfileStatus();
      return { success: true, message: 'Registration successful' };
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message); // <-- Add this line
      setIsAuthenticated(false);
      setProfileComplete(false);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Function to update profile completion status
  const updateProfileComplete = (status) => {
    setProfileComplete(status);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      loading,
      user,
      profileComplete,
      refreshProfileStatus,
      updateProfileComplete,
      login,
      register,
      logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);