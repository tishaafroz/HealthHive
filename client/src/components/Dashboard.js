import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BMICalculator from './BMICalculator';
import FoodSearch from './FoodSearch';
import MealPlanner from './MealPlanner';
import { 
  FaUser, 
  FaCalculator, 
  FaUtensils, 
  FaCalendarAlt, 
  FaChartLine, 
  FaHeart, 
  FaWeight, 
  FaRunning,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout, profileComplete } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    bmi: null,
    lastUpdated: null,
    streak: 0
  });

  useEffect(() => {
    // Fetch user stats if profile is complete
    if (profileComplete) {
      // TODO: Fetch actual stats from API
      setStats({
        bmi: 24.5,
        lastUpdated: '2024-01-15',
        streak: 7
      });
    }
  }, [profileComplete]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCompleteProfile = () => {
    navigate('/profile-setup');
  };

  const renderOverview = () => (
    <div className="overview-content">
      {!profileComplete ? (
        <div className="profile-completion-alert">
          <div className="alert-header">
            <FaExclamationTriangle className="alert-icon" />
            <h3>Complete Your Profile</h3>
          </div>
          <p>To get the most out of HealthHive, please complete your profile setup to receive personalized recommendations.</p>
          <button 
            className="btn btn-primary btn-large"
            onClick={handleCompleteProfile}
          >
            Complete Profile <FaArrowRight />
          </button>
        </div>
      ) : (
        <div className="dashboard-stats">
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FaWeight />
              </div>
              <div className="stat-content">
                <h3>Current BMI</h3>
                <p className="stat-value">{stats.bmi}</p>
                <span className="stat-label">Healthy Range</span>
              </div>
            </div>
            
            <div className="stat-card secondary">
              <div className="stat-icon">
                <FaHeart />
              </div>
              <div className="stat-content">
                <h3>Health Streak</h3>
                <p className="stat-value">{stats.streak}</p>
                <span className="stat-label">Days</span>
              </div>
            </div>
            
            <div className="stat-card tertiary">
              <div className="stat-icon">
                <FaRunning />
              </div>
              <div className="stat-content">
                <h3>Last Updated</h3>
                <p className="stat-value">{stats.lastUpdated}</p>
                <span className="stat-label">Profile</span>
              </div>
            </div>
          </div>
          
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button 
                className="action-btn"
                onClick={() => handleTabChange('bmi')}
              >
                <FaCalculator />
                <span>Calculate BMI</span>
              </button>
              <button 
                className="action-btn"
                onClick={() => handleTabChange('food')}
              >
                <FaUtensils />
                <span>Search Foods</span>
              </button>
              <button 
                className="action-btn"
                onClick={() => handleTabChange('meal')}
              >
                <FaCalendarAlt />
                <span>Plan Meals</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'bmi':
        return <BMICalculator />;
      case 'food':
        return <FoodSearch />;
      case 'meal':
        return <MealPlanner />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="brand-section">
            <h1 className="brand-title">HealthHive</h1>
            <p className="brand-subtitle">Your Health & Nutrition Companion</p>
          </div>
          
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">
                <FaUser />
              </div>
              <div className="user-details">
                <p className="user-greeting">Hello, {user?.firstName || 'User'}!</p>
                <p className="user-status">
                  {profileComplete ? (
                    <span className="status-complete">
                      <FaCheckCircle /> Profile Complete
                    </span>
                  ) : (
                    <span className="status-incomplete">
                      <FaExclamationTriangle /> Profile Incomplete
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-container">
          <button
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <FaChartLine />
            <span>Overview</span>
          </button>
          
          <button
            className={`nav-tab ${activeTab === 'bmi' ? 'active' : ''}`}
            onClick={() => handleTabChange('bmi')}
          >
            <FaCalculator />
            <span>BMI Calculator</span>
          </button>
          
          <button
            className={`nav-tab ${activeTab === 'food' ? 'active' : ''}`}
            onClick={() => handleTabChange('food')}
          >
            <FaUtensils />
            <span>Food Database</span>
          </button>
          
          <button
            className={`nav-tab ${activeTab === 'meal' ? 'active' : ''}`}
            onClick={() => handleTabChange('meal')}
          >
            <FaCalendarAlt />
            <span>Meal Planning</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="main-container">
          {renderTabContent()}
        </div>
      </main>

      {/* Feature Cards - Only show on overview tab */}
      {activeTab === 'overview' && (
        <section className="feature-cards">
          <div className="cards-container">
            <div className="feature-card" onClick={() => handleTabChange('bmi')}>
              <div className="card-icon">
                <FaCalculator />
              </div>
              <h3>BMI Calculator</h3>
              <p>Track your Body Mass Index and monitor your health progress over time</p>
              <div className="card-action">
                <span>Get Started</span>
                <FaArrowRight />
              </div>
            </div>
            
            <div className="feature-card" onClick={() => handleTabChange('food')}>
              <div className="card-icon">
                <FaUtensils />
              </div>
              <h3>Food Database</h3>
              <p>Search thousands of foods with detailed nutritional information and tracking</p>
              <div className="card-action">
                <span>Explore Foods</span>
                <FaArrowRight />
              </div>
            </div>
            
            <div className="feature-card" onClick={() => handleTabChange('meal')}>
              <div className="card-icon">
                <FaCalendarAlt />
              </div>
              <h3>Meal Planning</h3>
              <p>Generate personalized meal plans based on your goals and preferences</p>
              <div className="card-action">
                <span>Plan Meals</span>
                <FaArrowRight />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;