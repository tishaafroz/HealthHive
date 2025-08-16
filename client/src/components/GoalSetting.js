import React from 'react';
import '../styles/ProfileSetup.css';

const GoalSetting = ({ data, onUpdate, errors }) => {
  const handleChange = (field, value) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  return (
    <div>
      <h3>Health Goals</h3>
      <p>Tell us about your health and fitness goals to create a personalized plan.</p>
      
      <div className="floating-label-group">
        <select
          value={data.primaryGoal || ''}
          onChange={e => handleChange('primaryGoal', e.target.value)}
          required
        >
          <option value="">Select your primary goal</option>
          <option value="maintain_weight">Maintain Weight</option>
          <option value="lose_weight">Lose Weight</option>
          <option value="gain_weight">Gain Weight</option>
          <option value="build_muscle">Build Muscle</option>
          <option value="improve_fitness">Improve Fitness</option>
        </select>
        <label className="floating-label">Primary Health Goal</label>
        {errors && errors.primaryGoal && <div className="error">{errors.primaryGoal}</div>}
      </div>
      
      {(data.primaryGoal === 'lose_weight' || data.primaryGoal === 'gain_weight') && (
        <>
          <div className="floating-label-group">
            <input
              type="number"
              value={data.targetWeight || ''}
              onChange={e => handleChange('targetWeight', e.target.value)}
              min={20}
              max={500}
              placeholder=" "
              required
            />
            <label className="floating-label">Target Weight (kg)</label>
            {errors && errors.targetWeight && <div className="error">{errors.targetWeight}</div>}
          </div>
          
          <div className="floating-label-group">
            <select
              value={data.weeklyGoal || ''}
              onChange={e => handleChange('weeklyGoal', e.target.value)}
              required
            >
              <option value="">Select weekly target</option>
              <option value="0.25">0.25 kg per week (Slow)</option>
              <option value="0.5">0.5 kg per week (Moderate)</option>
              <option value="0.75">0.75 kg per week (Fast)</option>
              <option value="1">1 kg per week (Very Fast)</option>
            </select>
            <label className="floating-label">Weekly Goal</label>
            {errors && errors.weeklyGoal && <div className="error">{errors.weeklyGoal}</div>}
          </div>
        </>
      )}
    </div>
  );
};

export default GoalSetting; 