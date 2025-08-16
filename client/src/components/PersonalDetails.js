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
    <div className="personal-details-step">
      <h3>Personal Information</h3>
      <p>Please provide your basic information to help us personalize your experience.</p>
      
      <div className="form-fields">
        <NumberStepper
          label="Age"
          value={safeData.age}
          onChange={val => handleChange('age', val)}
          min={13}
          max={120}
          error={errors.age}
        />
        <NumberStepper
          label="Height"
          value={safeData.height}
          onChange={val => handleChange('height', val)}
          min={50}
          max={300}
          error={errors.height}
          unit="cm"
        />
        <NumberStepper
          label="Weight"
          value={safeData.weight}
          onChange={val => handleChange('weight', val)}
          min={20}
          max={500}
          error={errors.weight}
          unit="kg"
        />
        <div className="floating-label-group">
          <select
            value={safeData.gender}
            onChange={e => handleChange('gender', e.target.value)}
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <label className="floating-label">Gender</label>
          {errors.gender && <div className="error">{errors.gender}</div>}
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails; 