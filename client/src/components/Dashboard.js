import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BMICalculator from './BMICalculator';
import FoodSearch from './FoodSearch';
import MealPlanner from './MealPlanner';
import '../styles/Auth.css';

const Dashboard = () => {
  const { user, logout, profileComplete } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'bmi':
        return <BMICalculator />;
      case 'foods':
        return <FoodSearch />;
      case 'meals':
        return <MealPlanner />;
      default:
        return (
          <div className="dashboard-overview">
            <h2>Welcome to HealthHive!</h2>
            <p>Your comprehensive health and nutrition companion.</p>
            
            {/* Profile Completion Warning */}
            {profileComplete === false && (
              <div className="profile-warning">
                <h3>⚠️ Complete Your Profile</h3>
                <p>To get the most out of HealthHive, please complete your profile setup.</p>
                <button 
                  className="complete-profile-btn"
                  onClick={() => window.location.href = '/profile-setup'}
                >
                  Complete Profile
                </button>
              </div>
            )}
            
            <div className="feature-grid">
              <div className="feature-card" onClick={() => setActiveTab('bmi')}>
                <h3>BMI Calculator</h3>
                <p>Track your Body Mass Index and get personalized health recommendations</p>
              </div>
              
              <div className="feature-card" onClick={() => setActiveTab('foods')}>
                <h3>Food Database</h3>
                <p>Search thousands of foods with complete nutritional information</p>
              </div>
              
              <div className="feature-card" onClick={() => setActiveTab('meals')}>
                <h3>Meal Planning</h3>
                <p>Generate personalized meal plans based on your health goals</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="auth-bg dashboard-bg">
      <div className="dashboard-card">
        <header className="dashboard-header">
          <h1>HealthHive Dashboard</h1>
          <div className="user-info">
            <span>Hello, {user?.firstName}!</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </header>
        
        <nav className="dashboard-nav">
          <button 
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`nav-btn ${activeTab === 'bmi' ? 'active' : ''}`}
            onClick={() => setActiveTab('bmi')}
          >
            BMI Calculator
          </button>
          <button 
            className={`nav-btn ${activeTab === 'foods' ? 'active' : ''}`}
            onClick={() => setActiveTab('foods')}
          >
            Food Database
          </button>
          <button 
            className={`nav-btn ${activeTab === 'meals' ? 'active' : ''}`}
            onClick={() => setActiveTab('meals')}
          >
            Meal Planning
          </button>
        </nav>
        
        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;