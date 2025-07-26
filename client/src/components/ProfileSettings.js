import React, { useState } from 'react';
import '../styles/ProfileSetup.css';

const initialProfileData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
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

const sidebarItems = [
  { label: 'General', key: 'general' },
  { label: 'Preferences', key: 'preferences' },
  { label: 'Security', key: 'security' },
  // Add more as needed
];

const ProfileSettings = () => {
  const [profileData, setProfileData] = useState(initialProfileData);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');

  const handleChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckbox = (opt) => {
    let prefs = [...profileData.dietaryPreferences];
    if (prefs.includes(opt)) {
      prefs = prefs.filter(p => p !== opt);
    } else {
      prefs.push(opt);
    }
    handleChange('dietaryPreferences', prefs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation and API call here
    setSuccess('Profile updated!');
    setApiError('');
  };

  return (
    <div className="settings-bg">
      <div className="settings-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-avatar">SE</div>
          <div className="sidebar-title">Alex Smith's App</div>
        </div>
        <nav>
          {sidebarItems.map(item => (
            <div className="sidebar-item" key={item.key}>
              {item.label}
            </div>
          ))}
        </nav>
      </div>
      <form className="settings-card" onSubmit={handleSubmit}>
        <h2>General</h2>
        <div className="profile-photo-row">
          <div className="profile-photo-avatar">
            {profileData.firstName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="profile-photo-label">Profile photo</div>
            <button type="button" className="profile-photo-upload">Upload new picture</button>
          </div>
        </div>
        <div className="floating-label-group">
          <input
            type="text"
            value={profileData.firstName}
            onChange={e => handleChange('firstName', e.target.value)}
            placeholder=" "
            required
          />
          <label className="floating-label">First name</label>
        </div>
        <div className="floating-label-group">
          <input
            type="text"
            value={profileData.lastName}
            onChange={e => handleChange('lastName', e.target.value)}
            placeholder=" "
            required
          />
          <label className="floating-label">Last name</label>
        </div>
        <div className="floating-label-group">
          <input
            type="email"
            value={profileData.email}
            onChange={e => handleChange('email', e.target.value)}
            placeholder=" "
            required
          />
          <label className="floating-label">Email</label>
        </div>
        <div className="floating-label-group">
          <input
            type="tel"
            value={profileData.phone}
            onChange={e => handleChange('phone', e.target.value)}
            placeholder=" "
          />
          <label className="floating-label">Phone</label>
        </div>
        <div className="floating-label-group">
          <input
            type="number"
            value={profileData.age}
            onChange={e => handleChange('age', e.target.value)}
            min={13}
            max={120}
            placeholder=" "
          />
          <label className="floating-label">Age</label>
        </div>
        <div className="floating-label-group">
          <select
            value={profileData.gender}
            onChange={e => handleChange('gender', e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <label className="floating-label">Gender</label>
        </div>
        <div className="floating-label-group">
          <input
            type="number"
            value={profileData.height}
            onChange={e => handleChange('height', e.target.value)}
            min={50}
            max={300}
            placeholder=" "
          />
          <label className="floating-label">Height (cm)</label>
        </div>
        <div className="floating-label-group">
          <input
            type="number"
            value={profileData.weight}
            onChange={e => handleChange('weight', e.target.value)}
            min={20}
            max={500}
            placeholder=" "
          />
          <label className="floating-label">Weight (kg)</label>
        </div>
        <div className="floating-label-group">
          <select
            value={profileData.activityLevel}
            onChange={e => handleChange('activityLevel', e.target.value)}
          >
            <option value="">Select activity level</option>
            <option value="sedentary">Sedentary (little or no exercise)</option>
            <option value="light">Light (light exercise 1-3 days/week)</option>
            <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
            <option value="active">Active (hard exercise 6-7 days/week)</option>
            <option value="very_active">Very Active (very hard exercise, physical job)</option>
          </select>
          <label className="floating-label">Activity Level</label>
        </div>
        <div className="floating-label-group">
          <select
            value={profileData.healthGoal}
            onChange={e => handleChange('healthGoal', e.target.value)}
          >
            <option value="maintain_weight">Maintain Weight</option>
            <option value="lose_weight">Lose Weight</option>
            <option value="gain_weight">Gain Weight</option>
          </select>
          <label className="floating-label">Health Goal</label>
        </div>
        {(profileData.healthGoal === 'lose_weight' || profileData.healthGoal === 'gain_weight') && (
          <>
            <div className="floating-label-group">
              <input
                type="number"
                value={profileData.targetWeight}
                onChange={e => handleChange('targetWeight', e.target.value)}
                min={20}
                max={500}
                placeholder=" "
              />
              <label className="floating-label">Target Weight (kg)</label>
            </div>
            <div className="floating-label-group">
              <input
                type="date"
                value={profileData.goalTimeline}
                onChange={e => handleChange('goalTimeline', e.target.value)}
                placeholder=" "
              />
              <label className="floating-label">Goal Timeline</label>
            </div>
          </>
        )}
        <div style={{ marginBottom: 16, fontWeight: 600 }}>Dietary Preferences</div>
        {['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'none'].map(opt => (
          <label key={opt} className="checkbox-label">
            <input
              type="checkbox"
              checked={profileData.dietaryPreferences.includes(opt)}
              onChange={() => handleCheckbox(opt)}
            />
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </label>
        ))}
        <div style={{ marginTop: 24 }}>
          <button type="submit" className="settings-save-btn">Save Changes</button>
        </div>
        {apiError && <div className="error">{apiError}</div>}
        {success && <div className="success">{success}</div>}
      </form>
    </div>
  );
};

export default ProfileSettings;
