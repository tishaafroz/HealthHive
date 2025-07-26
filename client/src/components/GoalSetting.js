import React from 'react';
import '../styles/ProfileSetup.css';

const GoalSetting = ({ data, onChange, errors }) => (
  <div>
    <div className="floating-label-group">
      <select
        value={data.healthGoal}
        onChange={e => onChange('healthGoal', e.target.value)}
        required
      >
        <option value="maintain_weight">Maintain Weight</option>
        <option value="lose_weight">Lose Weight</option>
        <option value="gain_weight">Gain Weight</option>
      </select>
      <label className="floating-label">Health Goal</label>
      {errors.healthGoal && <div className="error">{errors.healthGoal}</div>}
    </div>
    {(data.healthGoal === 'lose_weight' || data.healthGoal === 'gain_weight') && (
      <>
        <div className="floating-label-group">
          <input
            type="number"
            value={data.targetWeight}
            onChange={e => onChange('targetWeight', e.target.value)}
            min={20}
            max={500}
            placeholder=" "
            required
          />
          <label className="floating-label">Target Weight (kg)</label>
          {errors.targetWeight && <div className="error">{errors.targetWeight}</div>}
        </div>
        <div className="floating-label-group">
          <input
            type="date"
            value={data.goalTimeline}
            onChange={e => onChange('goalTimeline', e.target.value)}
            placeholder=" "
          />
          <label className="floating-label">Goal Timeline</label>
        </div>
      </>
    )}
  </div>
);

export default GoalSetting; 