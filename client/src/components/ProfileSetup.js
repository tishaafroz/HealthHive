import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PersonalDetails from './PersonalDetails';
import GoalSetting from './GoalSetting';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { 
  FaUser, 
  FaRunning, 
  FaBullseye, 
  FaUtensils, 
  FaChartBar, 
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaTimes,
  FaCog
} from 'react-icons/fa';
import '../styles/ProfileSetup.css';

const steps = [
  'Personal Details',
  'Activity Level',
  'Goals',
  'Dietary Preferences',
  'Review & Complete'
];

const ProfileSetup = () => {
  const { updateProfileComplete } = useAuth();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personalDetails: {
      age: '',
      height: '',
      weight: '',
      gender: ''
    },
    activityLevel: '',
    goals: {
      primaryGoal: '',
      targetWeight: '',
      weeklyGoal: ''
    },
    dietaryPreferences: {
      restrictions: [],
      preferences: [],
      allergies: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Get step icon based on step name
  const getStepIcon = (stepName) => {
    switch (stepName) {
      case 'Personal Details':
        return <FaUser className="step-icon" />;
      case 'Activity Level':
        return <FaRunning className="step-icon" />;
      case 'Goals':
        return <FaBullseye className="step-icon" />;
      case 'Dietary Preferences':
        return <FaUtensils className="step-icon" />;
      case 'Review & Complete':
        return <FaCheckCircle className="step-icon" />;
      default:
        return <FaUser className="step-icon" />;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleFormDataUpdate = (stepData, stepName) => {
    setFormData(prev => ({
      ...prev,
      [stepName]: stepData
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Combine all form data
      const completeProfile = {
        ...formData.personalDetails,
        activityLevel: formData.activityLevel,
        goals: formData.goals,
        dietaryPreferences: formData.dietaryPreferences,
        profileComplete: true
      };

      // Update user profile
      const token = localStorage.getItem('token');
      await axios.put('/api/users/profile', completeProfile, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      updateProfileComplete(true);
      
      // Show confetti
      setShowConfetti(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupLater = () => {
    // Mark profile as incomplete but allow access to dashboard
    updateProfileComplete(false);
    navigate('/dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalDetails
            data={formData.personalDetails}
            onUpdate={(data) => handleFormDataUpdate(data, 'personalDetails')}
          />
        );
      case 1:
        return (
          <GoalSetting
            data={formData.activityLevel}
            onUpdate={(data) => handleFormDataUpdate(data, 'activityLevel')}
          />
        );
      case 2:
        return (
          <GoalSetting
            data={formData.goals}
            onUpdate={(data) => handleFormDataUpdate(data, 'goals')}
          />
        );
      case 3:
        return (
          <div className="dietary-preferences">
            <h3>Dietary Preferences</h3>
            <p>This step will be implemented in future sprints.</p>
          </div>
        );
      case 4:
        return (
          <div className="review-step">
            <h3>Review Your Profile</h3>
            <div className="profile-summary">
              <h4>Personal Details</h4>
              <pre>{JSON.stringify(formData.personalDetails, null, 2)}</pre>
              
              <h4>Activity Level</h4>
              <p>{formData.activityLevel || 'Not specified'}</p>
              
              <h4>Goals</h4>
              <pre>{JSON.stringify(formData.goals, null, 2)}</pre>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-setup-container">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <div className="profile-setup-header">
        <div className="header-content">
          <h1>Complete Your Profile</h1>
          <p>Let's get to know you better to personalize your health journey</p>
          
          <div className="setup-options">
            <button 
              className="btn btn-primary btn-large"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
            
            <button 
              className="btn btn-secondary btn-large"
              onClick={handleSetupLater}
            >
              Setup Profile Later
            </button>
          </div>
        </div>
      </div>

      <div className="profile-setup-content">
        <div className="step-indicator">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => handleStepClick(index)}
            >
              <div className="step-number">
                {index < currentStep ? (
                  <FaCheckCircle className="step-check" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="step-info">
                <div className="step-icon-wrapper">
                  {getStepIcon(step)}
                </div>
                <span className="step-title">{step}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="step-content">
          {renderStepContent()}
        </div>

        <div className="step-navigation">
          {currentStep > 0 && (
            <button 
              className="btn btn-outline"
              onClick={handlePrevious}
            >
              <FaArrowLeft /> Previous
            </button>
          )}
          
          {currentStep < steps.length - 1 && (
            <button 
              className="btn btn-primary"
              onClick={handleNext}
            >
              Next <FaArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup; 