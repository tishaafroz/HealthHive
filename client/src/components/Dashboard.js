import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome to HealthTracker Pro</h1>
        <div className="user-info">
          <span>Hello, {user?.firstName}!</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      
      <main>
        <p>Dashboard content will be implemented in Sprint 2</p>
      </main>
    </div>
  );
};

export default Dashboard;