import React from 'react';
import '../styles/ProfileSetup.css';

const ActivityLevel = ({ data, onUpdate, errors }) => {
  const activityLevels = [
    {
      value: 'sedentary',
      title: 'Sedentary',
      description: 'Little to no exercise',
      icon: '🪑'
    },
    {
      value: 'lightly_active',
      title: 'Lightly Active',
      description: 'Light exercise 1-3 days/week',
      icon: '🚶'
    },
    {
      value: 'moderately_active',
      title: 'Moderately Active',
      description: 'Moderate exercise 3-5 days/week',
      icon: '🏃'
    },
    {
      value: 'very_active',
      title: 'Very Active',
      description: 'Hard exercise 6-7 days/week',
      icon: '💪'
    },
    {
      value: 'extremely_active',
      title: 'Extremely Active',
      description: 'Very hard exercise, sports',
      icon: '🏋️'
    }
  ];

  const handleChange = (value) => {
    onUpdate(value);
  };

  return (
    <div className="mobile-form-container">
      <div className="activity-level-grid">
        {activityLevels.map((level) => (
          <div
            key={level.value}
            className={`activity-card ${data === level.value ? 'selected' : ''}`}
            onClick={() => handleChange(level.value)}
          >
            <div className="activity-icon">{level.icon}</div>
            <div className="activity-content">
              <h4 className="activity-title">{level.title}</h4>
              <p className="activity-description">{level.description}</p>
            </div>
            <div className="selection-indicator">
              {data === level.value && <div className="check-mark">✓</div>}
            </div>
          </div>
        ))}
      </div>
      {errors && <div className="error">{errors}</div>}
    </div>
  );
};

export default ActivityLevel;
