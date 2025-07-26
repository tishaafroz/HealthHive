import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SmartRoute = ({ children, requireProfileComplete }) => {
  const { isAuthenticated, loading } = useAuth();
  const [profileComplete, setProfileComplete] = useState(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkProfile = async () => {
      if (isAuthenticated) {
        try {
          const res = await axios.get('/api/users/profile/status');
          setProfileComplete(res.data.isComplete);
        } catch {
          setProfileComplete(false);
        }
      }
      setChecking(false);
    };
    checkProfile();
  }, [isAuthenticated]);

  if (loading || (isAuthenticated && checking)) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} />;
  if (requireProfileComplete && !profileComplete) return <Navigate to="/profile-setup" />;
  if (!requireProfileComplete && profileComplete) return <Navigate to="/dashboard" />;
  return children;
};

export default SmartRoute; 