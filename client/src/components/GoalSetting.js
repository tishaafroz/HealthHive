import React from 'react';
import '../styles/ProfileSetup.css';

const GoalSetting = ({ data, onUpdate, errors }) => {
  const goals = [
    {
      value: 'maintain_weight',
      title: 'Maintain Weight',
      description: 'Keep your current weight',
      icon: '⚖️'
    },
    {
      value: 'lose_weight',
      title: 'Lose Weight',
      description: 'Reduce body weight gradually',
      icon: '📉'
    },
    {
      value: 'gain_weight',
      title: 'Gain Weight',
      description: 'Increase body weight healthily',
      icon: '📈'
    },
    {
      value: 'build_muscle',
      title: 'Build Muscle',
      description: 'Increase muscle mass and strength',
      icon: '💪'
    },
    {
      value: 'improve_fitness',
      title: 'Improve Fitness',
      description: 'Enhance overall fitness level',
      icon: '🏃'
    }
  ];

  const handleChange = (field, value) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  const handleGoalSelect = (goalValue) => {
    const updatedData = {
      ...data,
      primaryGoal: goalValue
    };
    
    // For goals that don't need weekly targets, set a default value
    if (goalValue === 'maintain_weight' || goalValue === 'build_muscle' || goalValue === 'improve_fitness') {
      updatedData.weeklyGoal = 'maintain'; // Set a default value
      updatedData.targetWeight = null; // Clear target weight
    }
    
    onUpdate(updatedData);
  };

  return (
    <div className="mobile-form-container">
      <div className="goals-grid">
        {goals.map((goal) => (
          <div
            key={goal.value}
            className={`goal-card ${data.primaryGoal === goal.value ? 'selected' : ''}`}
            onClick={() => handleGoalSelect(goal.value)}
          >
            <div className="goal-icon">{goal.icon}</div>
            <div className="goal-content">
              <h4 className="goal-title">{goal.title}</h4>
              <p className="goal-description">{goal.description}</p>
            </div>
            <div className="selection-indicator">
              {data.primaryGoal === goal.value && <div className="check-mark">✓</div>}
            </div>
          </div>
        ))}
      </div>

      {(data.primaryGoal === 'lose_weight' || data.primaryGoal === 'gain_weight') && (
        <div className="goal-details">
          <div className="form-field-group">
            <label className="field-label">Target Weight (kg)</label>
            <input
              type="number"
              className="mobile-input"
              value={data.targetWeight || ''}
              onChange={e => handleChange('targetWeight', e.target.value)}
              min={20}
              max={500}
              placeholder="Enter target weight"
            />
            {errors && errors.targetWeight && <div className="error">{errors.targetWeight}</div>}
          </div>
          
          <div className="form-field-group">
            <label className="field-label">Weekly Goal</label>
            <div className="weekly-goal-options">
              {[
                { value: '0.25', label: '0.25 kg/week', subtitle: 'Slow & steady' },
                { value: '0.5', label: '0.5 kg/week', subtitle: 'Moderate pace' },
                { value: '0.75', label: '0.75 kg/week', subtitle: 'Fast progress' },
                { value: '1', label: '1 kg/week', subtitle: 'Very fast' }
              ].map((option) => (
                <div
                  key={option.value}
                  className={`weekly-goal-card ${data.weeklyGoal === option.value ? 'selected' : ''}`}
                  onClick={() => handleChange('weeklyGoal', option.value)}
                >
                  <div className="weekly-goal-label">{option.label}</div>
                  <div className="weekly-goal-subtitle">{option.subtitle}</div>
                  <div className="selection-indicator">
                    {data.weeklyGoal === option.value && <div className="check-mark">✓</div>}
                  </div>
                </div>
              ))}
            </div>
            {errors && errors.weeklyGoal && <div className="error">{errors.weeklyGoal}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalSetting; 