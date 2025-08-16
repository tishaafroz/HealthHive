import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PersonalDetails from './PersonalDetails';
import GoalSetting from './GoalSetting';
import ProfileProgress from './ProfileProgress';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import '../styles/ProfileSetup.css';

const steps = [
  'Personal Details',
  'Activity Level',
  'Goals',
  'Dietary Preferences',
  'Review'
];

const initialProfileData = {
  age: '',
  gender: '',
  height: '',
  weight: '',
  activityLevel: 'moderate',
  healthGoal: 'maintain_weight',
  targetWeight: '',
  goalTimeline: '',
  dietaryPreferences: [],
};

function formatKey(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ');
}

const ProfileSetup = () => {
  const { refreshProfileStatus } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('profileData');
    return saved ? JSON.parse(saved) : initialProfileData;
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, height] = useWindowSize();

  useEffect(() => {
    localStorage.setItem('profileData', JSON.stringify(profileData));
  }, [profileData]);

  useEffect(() => {
    validateStep();
    // eslint-disable-next-line
  }, [profileData, currentStep]);

  const validateStep = () => {
    let stepErrors = {};
    if (currentStep === 0) {
      if (!profileData.age || profileData.age < 13 || profileData.age > 120)
        stepErrors.age = 'Age must be between 13 and 120.';
      if (!profileData.gender)
        stepErrors.gender = 'Gender is required.';
      if (!profileData.height || profileData.height < 50 || profileData.height > 300)
        stepErrors.height = 'Height must be between 50 and 300 cm.';
      if (!profileData.weight || profileData.weight < 20 || profileData.weight > 500)
        stepErrors.weight = 'Weight must be between 20 and 500 kg.';
    }
    if (currentStep === 1) {
      if (!profileData.activityLevel)
        stepErrors.activityLevel = 'Activity level is required.';
    }
    if (currentStep === 2) {
      if (!profileData.healthGoal)
        stepErrors.healthGoal = 'Health goal is required.';
      if (
        ['lose_weight', 'gain_weight'].includes(profileData.healthGoal) &&
        (!profileData.targetWeight ||
          profileData.targetWeight < 20 ||
          profileData.targetWeight > 500 ||
          (profileData.healthGoal === 'lose_weight' && Number(profileData.targetWeight) >= Number(profileData.weight)) ||
          (profileData.healthGoal === 'gain_weight' && Number(profileData.targetWeight) <= Number(profileData.weight)))
      ) {
        stepErrors.targetWeight = 'Target weight must be valid and logical for your goal.';
      }
    }
    if (currentStep === 3) {
      if (!Array.isArray(profileData.dietaryPreferences))
        stepErrors.dietaryPreferences = 'Please select at least one preference or "No restrictions".';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setApiError('');
    setSuccess('');
    
    try {
      // First, update the user profile
      await axios.put('/api/users/profile', profileData);
      
      // Mark profile as complete
      await axios.put('/api/users/profile/complete', { profileCompleted: true });
      
      setSuccess('Profile completed successfully!');
      localStorage.removeItem('profileData');
      setShowConfetti(true);
      
      // Refresh profile status
      await refreshProfileStatus();
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Profile save error:', err);
      setApiError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipProfile = async () => {
    console.log('Skip profile clicked');
    setLoading(true);
    
    try {
      // Mark profile as incomplete but allow access to dashboard
      await axios.put('/api/users/profile/complete', { 
        profileCompleted: false,
        profileCompletionPercentage: 0
      });
      
      console.log('Profile marked as incomplete');
      
      // Refresh profile status
      await refreshProfileStatus();
      
      console.log('Profile status refreshed, navigating to dashboard...');
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Skip profile error:', err);
      // Even if there's an error, navigate to dashboard
      console.log('Error occurred, but still navigating to dashboard...');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Alternative method using window.location if navigate doesn't work
  const forceRedirectToDashboard = () => {
    console.log('Force redirect to dashboard');
    window.location.href = '/dashboard';
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalDetails
            data={profileData}
            onChange={handleChange}
            errors={errors}
          />
        );
      case 1:
        return (
          <div>
            <div className="floating-label-group">
              <select
                value={profileData.activityLevel}
                onChange={e => handleChange('activityLevel', e.target.value)}
                required
              >
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Light (light exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                <option value="active">Active (hard exercise 6-7 days/week)</option>
                <option value="very_active">Very Active (very hard exercise, physical job)</option>
              </select>
              <label className="floating-label">Activity Level</label>
              {errors.activityLevel && <div className="error">{errors.activityLevel}</div>}
            </div>
          </div>
        );
      case 2:
        return (
          <GoalSetting
            data={profileData}
            onChange={handleChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <div>
            <div style={{ marginBottom: 16, fontWeight: 600 }}>Dietary Preferences</div>
            {['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'none'].map(opt => (
              <label key={opt} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={profileData.dietaryPreferences.includes(opt)}
                  onChange={e => {
                    let prefs = [...profileData.dietaryPreferences];
                    if (e.target.checked) {
                      prefs.push(opt);
                    } else {
                      prefs = prefs.filter(p => p !== opt);
                    }
                    handleChange('dietaryPreferences', prefs);
                  }}
                />
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </label>
            ))}
            {errors.dietaryPreferences && <div className="error">{errors.dietaryPreferences}</div>}
          </div>
        );
      case 4:
        return (
          <div>
            <div style={{ marginBottom: 16, fontWeight: 600, fontSize: '1.2rem' }}>Review & Confirm</div>
            <div className="review-card">
              <table className="review-table">
                <tbody>
                  {Object.entries(profileData).map(([key, value]) => (
                    <tr key={key}>
                      <td className="review-key">{formatKey(key)}</td>
                      <td className="review-value">
                        {Array.isArray(value)
                          ? value.length > 0 ? value.join(', ') : <span style={{ color: '#bbb' }}>None</span>
                          : value || <span style={{ color: '#bbb' }}>None</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-setup-bg">
      {showConfetti && <Confetti width={width} height={height} />}
      <div className="profile-setup-container">
        <ProfileProgress step={currentStep} totalSteps={steps.length} />
        <h1>
          {currentStep === steps.length - 1
            ? "You're all set! 🎉"
            : steps[currentStep]}
        </h1>
        {renderStep()}
        
        {/* Skip Profile Button - Show on all steps */}
        <div className="skip-profile-section">
          <button 
            onClick={handleSkipProfile}
            className="skip-profile-btn"
            disabled={loading}
          >
            {loading ? 'Redirecting...' : 'Setup Profile Later'}
          </button>
          
          {/* Fallback button if the first one doesn't work */}
          <button 
            onClick={forceRedirectToDashboard}
            className="skip-profile-btn fallback-btn"
            style={{ marginLeft: '10px' }}
          >
            Go to Dashboard (Fallback)
          </button>
          
          <p className="skip-profile-text">
            You can always complete your profile later from the dashboard
          </p>
        </div>
        
        <div className="navigation-buttons" style={{ marginTop: 20 }}>
          {currentStep > 0 && (
            <button onClick={handleBack} disabled={loading}>Back</button>
          )}
          {currentStep < steps.length - 1 && (
            <button onClick={handleNext} disabled={loading || Object.keys(errors).length > 0}>
              Next
            </button>
            )}
          {currentStep === steps.length - 1 && (
            <button onClick={handleSubmit} disabled={loading || Object.keys(errors).length > 0}>
              {loading ? 'Saving...' : 'Finish'}
            </button>
          )}
        </div>
        {apiError && <div className="error">{apiError}</div>}
        {success && <div className="success">{success}</div>}
      </div>
    </div>
  );
};

export default ProfileSetup; 