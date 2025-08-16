import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PersonalDetails from './PersonalDetails';
import ActivityLevel from './ActivityLevel';
import GoalSetting from './GoalSetting';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { 
  FaUser, 
  FaRunning, 
  FaBullseye, 
  FaUtensils, 
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft
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
          <ActivityLevel
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
            <div className="coming-soon-container">
              <div className="coming-soon-icon">
                <FaUtensils />
              </div>
              <h3>Dietary Preferences</h3>
              <p className="coming-soon-text">
                We're working on this feature to help you track your dietary preferences, 
                allergies, and nutritional requirements.
              </p>
              <div className="feature-preview">
                <div className="preview-item">
                  <FaCheckCircle className="preview-icon" />
                  <span>Dietary Restrictions</span>
                </div>
                <div className="preview-item">
                  <FaCheckCircle className="preview-icon" />
                  <span>Food Allergies</span>
                </div>
                <div className="preview-item">
                  <FaCheckCircle className="preview-icon" />
                  <span>Meal Preferences</span>
                </div>
                <div className="preview-item">
                  <FaCheckCircle className="preview-icon" />
                  <span>Nutritional Goals</span>
                </div>
              </div>
              <p className="coming-soon-note">
                This will be available in future updates. For now, you can skip this step.
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="review-step">
            <div className="review-header">
              <h3>Review Your Health Profile</h3>
              <p>Please review your information before completing the setup</p>
            </div>
            
            <div className="profile-summary">
              <div className="summary-card">
                <div className="card-header">
                  <FaUser className="card-icon" />
                  <h4>Personal Details</h4>
                </div>
                <div className="card-content">
                  <div className="detail-row">
                    <span className="label">Age:</span>
                    <span className="value">{formData.personalDetails.age || 'Not specified'} years</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Height:</span>
                    <span className="value">{formData.personalDetails.height || 'Not specified'} cm</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Weight:</span>
                    <span className="value">{formData.personalDetails.weight || 'Not specified'} kg</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Gender:</span>
                    <span className="value">{formData.personalDetails.gender || 'Not specified'}</span>
                  </div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="card-header">
                  <FaRunning className="card-icon" />
                  <h4>Activity Level</h4>
                </div>
                <div className="card-content">
                  <div className="activity-badge">
                    {formData.activityLevel || 'Not specified'}
                  </div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="card-header">
                  <FaBullseye className="card-icon" />
                  <h4>Health Goals</h4>
                </div>
                <div className="card-content">
                  <div className="detail-row">
                    <span className="label">Primary Goal:</span>
                    <span className="value">{formData.goals.primaryGoal || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Target Weight:</span>
                    <span className="value">{formData.goals.targetWeight ? `${formData.goals.targetWeight} kg` : 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Weekly Goal:</span>
                    <span className="value">{formData.goals.weeklyGoal || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="review-actions">
              <p className="review-note">
                <FaCheckCircle className="note-icon" />
                Ready to start your health journey? Click "Complete Setup" to save your profile.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-setup-wrapper">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <div className="profile-setup-container">
        {/* Header Section */}
        <div className="profile-setup-header">
          <div className="header-content">
            <div className="header-badge">
              <FaUser className="badge-icon" />
              <span>Profile Setup</span>
            </div>
            <h1>Complete Your Health Profile</h1>
            <p>Let's personalize your journey to better health with a few quick questions</p>
            
            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
              <span className="progress-text">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-setup-content">
          {/* Enhanced Step Indicator */}
          <div className="step-indicator">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''} ${index > currentStep ? 'upcoming' : ''}`}
                onClick={() => handleStepClick(index)}
              >
                <div className="step-connector"></div>
                <div className="step-circle">
                  <div className="step-number">
                    {index < currentStep ? (
                      <FaCheckCircle className="step-check" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                </div>
                <div className="step-info">
                  <div className="step-icon-wrapper">
                    {getStepIcon(step)}
                  </div>
                  <span className="step-title">{step}</span>
                  <span className="step-subtitle">
                    {index === currentStep ? 'Current' : 
                     index < currentStep ? 'Completed' : 'Upcoming'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Step Content with Animation */}
          <div className="step-content-wrapper">
            <div className={`step-content step-${currentStep}`}>
              <div className="step-header">
                <div className="step-icon-large">
                  {getStepIcon(steps[currentStep])}
                </div>
                <h2>{steps[currentStep]}</h2>
              </div>
              
              <div className="step-body">
                {renderStepContent()}
              </div>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <div className="step-navigation">
            <div className="nav-left">
              {currentStep > 0 && (
                <button 
                  className="btn btn-outline btn-nav"
                  onClick={handlePrevious}
                >
                  <FaArrowLeft className="btn-icon" />
                  <span>Previous</span>
                </button>
              )}
            </div>
            
            <div className="nav-center">
              <div className="step-dots">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                    onClick={() => handleStepClick(index)}
                  ></div>
                ))}
              </div>
            </div>
            
            <div className="nav-right">
              {currentStep < steps.length - 1 ? (
                <button 
                  className="btn btn-primary btn-nav"
                  onClick={handleNext}
                >
                  <span>Next</span>
                  <FaArrowRight className="btn-icon" />
                </button>
              ) : (
                <button 
                  className="btn btn-success btn-nav btn-complete"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <FaCheckCircle className="btn-icon" />
                  <span>{loading ? 'Saving...' : 'Complete Setup'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="profile-setup-footer">
          <button 
            className="btn btn-ghost"
            onClick={handleSetupLater}
          >
            I'll complete this later
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup; 