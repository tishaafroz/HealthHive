import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProfileSetup from './components/ProfileSetup';
import BMICalculator from './components/BMICalculator';
import FoodSearch from './components/FoodSearch';
import MealPlanner from './components/MealPlanner';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SmartRoute from './components/SmartRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <SmartRoute requireProfileComplete={false}>
                <Dashboard />
              </SmartRoute>
            } />
            <Route path="/profile-setup" element={
              <SmartRoute requireProfileComplete={false}>
                <ProfileSetup />
              </SmartRoute>
            } />
            <Route path="/bmi-calculator" element={
              <SmartRoute requireProfileComplete={false}>
                <BMICalculator />
              </SmartRoute>
            } />
            <Route path="/food-database" element={
              <SmartRoute requireProfileComplete={false}>
                <FoodSearch />
              </SmartRoute>
            } />
            <Route path="/meal-planning" element={
              <SmartRoute requireProfileComplete={false}>
                <MealPlanner />
              </SmartRoute>
            } />
            <Route path="/analytics" element={
              <SmartRoute requireProfileComplete={true}>
                <AnalyticsDashboard />
              </SmartRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;