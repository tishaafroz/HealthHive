import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="auth-bg dashboard-bg">
      <div className="dashboard-card">
        <header className="dashboard-header">
          <h1>Welcome to HealthHive</h1>
          <div className="user-info">
            <span>Hello, {user?.firstName}!</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </header>
        <main>
          <p>Dashboard content will be implemented in Sprint 2</p>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;