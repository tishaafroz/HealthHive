import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const SmartRoute = ({ children, requireProfileComplete = true }) => {
  const { isAuthenticated, loading, profileComplete } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If profile completion is not required, just render the children
  if (!requireProfileComplete) {
    return children;
  }

  // If profile completion is required but profile is incomplete, redirect to profile setup
  if (requireProfileComplete && profileComplete === false) {
    return <Navigate to="/profile-setup" />;
  }

  // If profile completion is required and profile is complete, render the children
  if (requireProfileComplete && profileComplete === true) {
    return children;
  }

  // Default case: render children (for when profileComplete is null/undefined)
  // This allows access to dashboard even when profile status is unknown
  return children;
};

export default SmartRoute; // ✅ Only one export statement 