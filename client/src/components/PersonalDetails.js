import React from 'react';
import '../styles/ProfileSetup.css';

const NumberStepper = ({ label, value, onChange, min, max, error, unit }) => (
  <div className="stepper-group">
    <div className="stepper-label">{label}</div>
    <div className="stepper-controls">
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.max(min, Number(value || min) - 1))}
        disabled={Number(value || min) <= min}
      >-</button>
      <input
        type="number"
        className="stepper-input"
        value={value || ''}
        min={min}
        max={max}
        onChange={e => {
          let val = e.target.value;
          if (val === '') onChange('');
          else onChange(Math.max(min, Math.min(max, Number(val))));
        }}
        style={{
          width: 60,
          textAlign: 'center',
          fontSize: '1.15rem',
          fontWeight: 600,
          border: 'none',
          background: '#fff',
          color: '#23272f',
          borderRadius: '8px'
        }}
      />
      {unit && <span className="stepper-unit">{unit}</span>}
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.min(max, Number(value || min) + 1))}
        disabled={Number(value || min) >= max}
      >+</button>
    </div>
    {error && <div className="error">{error}</div>}
  </div>
);

const PersonalDetails = ({ data = {}, onUpdate, errors = {} }) => {
  // Ensure data has default values
  const safeData = {
    age: data.age || '',
    height: data.height || '',
    weight: data.weight || '',
    gender: data.gender || ''
  };

  const handleChange = (field, value) => {
    if (onUpdate) {
      onUpdate({ ...safeData, [field]: value });
    }
  };

  return (
    <div className="mobile-form-container">
      <div className="form-grid">
        <div className="form-field-group">
          <label className="field-label">Age</label>
          <div className="stepper-container">
            <NumberStepper
              label=""
              value={safeData.age}
              onChange={val => handleChange('age', val)}
              min={13}
              max={120}
              error={errors.age}
            />
          </div>
        </div>

        <div className="form-field-group">
          <label className="field-label">Height (cm)</label>
          <div className="stepper-container">
            <NumberStepper
              label=""
              value={safeData.height}
              onChange={val => handleChange('height', val)}
              min={50}
              max={300}
              error={errors.height}
              unit="cm"
            />
          </div>
        </div>

        <div className="form-field-group">
          <label className="field-label">Weight (kg)</label>
          <div className="stepper-container">
            <NumberStepper
              label=""
              value={safeData.weight}
              onChange={val => handleChange('weight', val)}
              min={20}
              max={500}
              error={errors.weight}
              unit="kg"
            />
          </div>
        </div>

        <div className="form-field-group">
          <label className="field-label">Gender</label>
          <div className="gender-options">
            <div 
              className={`gender-card ${safeData.gender === 'female' ? 'selected' : ''}`}
              onClick={() => handleChange('gender', 'female')}
            >
              <div className="gender-icon">♀</div>
              <span>Female</span>
            </div>
            <div 
              className={`gender-card ${safeData.gender === 'male' ? 'selected' : ''}`}
              onClick={() => handleChange('gender', 'male')}
            >
              <div className="gender-icon">♂</div>
              <span>Male</span>
            </div>
            <div 
              className={`gender-card ${safeData.gender === 'other' ? 'selected' : ''}`}
              onClick={() => handleChange('gender', 'other')}
            >
              <div className="gender-icon">⚧</div>
              <span>Other</span>
            </div>
          </div>
          {errors.gender && <div className="error">{errors.gender}</div>}
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails; 