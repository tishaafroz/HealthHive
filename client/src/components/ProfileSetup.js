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
      
      <div className="mobile-inspired-container">
        {/* Header with Back Button */}
        <div className="mobile-header">
          {currentStep > 0 && (
            <button className="back-btn" onClick={handlePrevious}>
              <FaArrowLeft />
            </button>
          )}
          <div className="progress-dots">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index <= currentStep ? 'active' : ''}`}
              ></div>
            ))}
          </div>
          <div className="header-spacer"></div>
        </div>

        {/* Main Question Card */}
        <div className="question-card">
          <div className="question-header">
            <h1 className="question-title">
              {currentStep === 0 && "What's your personal info?"}
              {currentStep === 1 && "What's your activity level?"}
              {currentStep === 2 && "What's your goal?"}
              {currentStep === 3 && "Your dietary preferences?"}
              {currentStep === 4 && "Review your profile"}
            </h1>
            <p className="question-subtitle">
              {currentStep === 0 && "Let's start with some basic details"}
              {currentStep === 1 && "This helps us personalize your plan"}
              {currentStep === 2 && "What would you like to achieve?"}
              {currentStep === 3 && "Any dietary restrictions or preferences?"}
              {currentStep === 4 && "Let's make sure everything looks good"}
            </p>
          </div>

          <div className="question-content">
            {renderStepContent()}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-navigation">
          {currentStep === steps.length - 1 ? (
            <button 
              className="continue-btn complete-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              <span>{loading ? 'Saving...' : 'Complete Setup'}</span>
              <FaCheckCircle className="btn-icon" />
            </button>
          ) : (
            <button 
              className="continue-btn"
              onClick={handleNext}
            >
              <span>Continue</span>
              <FaArrowRight className="btn-icon" />
            </button>
          )}
          
          <button 
            className="skip-btn"
            onClick={handleSetupLater}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup; 