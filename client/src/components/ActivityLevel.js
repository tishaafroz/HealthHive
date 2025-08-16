import React from 'react';
import '../styles/ProfileSetup.css';

const ActivityLevel = ({ data, onUpdate, errors }) => {
  const handleChange = (value) => {
    onUpdate(value);
  };

  return (
    <div>
      <h3>Activity Level</h3>
      <p>Select your typical weekly activity level to help us calculate your daily calorie needs.</p>
      
      <div className="activity-level-grid">
        <div 
          className={`activity-option ${data === 'sedentary' ? 'selected' : ''}`}
          onClick={() => handleChange('sedentary')}
        >
          <div className="activity-label">Sedentary</div>
          <div className="activity-desc">Little to no exercise<br/>Desk job, minimal physical activity</div>
        </div>
        
        <div 
          className={`activity-option ${data === 'lightly_active' ? 'selected' : ''}`}
          onClick={() => handleChange('lightly_active')}
        >
          <div className="activity-label">Lightly Active</div>
          <div className="activity-desc">Light exercise 1-3 days/week<br/>Occasional walks, light sports</div>
        </div>
        
        <div 
          className={`activity-option ${data === 'moderately_active' ? 'selected' : ''}`}
          onClick={() => handleChange('moderately_active')}
        >
          <div className="activity-label">Moderately Active</div>
          <div className="activity-desc">Moderate exercise 3-5 days/week<br/>Regular gym sessions, sports</div>
        </div>
        
        <div 
          className={`activity-option ${data === 'very_active' ? 'selected' : ''}`}
          onClick={() => handleChange('very_active')}
        >
          <div className="activity-label">Very Active</div>
          <div className="activity-desc">Hard exercise 6-7 days/week<br/>Daily workouts, intense training</div>
        </div>
        
        <div 
          className={`activity-option ${data === 'extremely_active' ? 'selected' : ''}`}
          onClick={() => handleChange('extremely_active')}
        >
          <div className="activity-label">Extremely Active</div>
          <div className="activity-desc">Very hard exercise, physical job<br/>Professional athlete, labor-intensive work</div>
        </div>
      </div>
      
      {errors && <div className="error">{errors}</div>}
    </div>
  );
};

export default ActivityLevel;
