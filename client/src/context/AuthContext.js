import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(null);

  // Fetch user and profile status on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/me'); // Adjust if your endpoint is different
        setUser(res.data);
        setIsAuthenticated(true);
        await refreshProfileStatus();
      } catch {
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
      await axios.post('/api/auth/login', credentials);
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
    await axios.post('/api/auth/logout');
    setIsAuthenticated(false);
    setUser(null);
    setProfileComplete(null);
  };

  const register = async (credentials) => {
    setLoading(true);
    try {
      await axios.post('/api/auth/register', credentials);
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

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      loading,
      user,
      profileComplete,
      refreshProfileStatus,
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