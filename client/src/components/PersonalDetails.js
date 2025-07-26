import React from 'react';
import '../styles/ProfileSetup.css';

const NumberStepper = ({ label, value, onChange, min, max, error, unit }) => (
  <div className="stepper-group">
    <div className="stepper-label">{label}</div>
    <div className="stepper-controls">
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.max(min, Number(value) - 1))}
        disabled={Number(value) <= min}
      >-</button>
      <input
        type="number"
        className="stepper-input"
        value={value}
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
        onClick={() => onChange(Math.min(max, Number(value) + 1))}
        disabled={Number(value) >= max}
      >+</button>
    </div>
    {error && <div className="error">{error}</div>}
  </div>
);

const PersonalDetails = ({ data, onChange, errors }) => (
  <div>
    <NumberStepper
      label="Age"
      value={data.age}
      onChange={val => onChange('age', val)}
      min={13}
      max={120}
      error={errors.age}
    />
    <NumberStepper
      label="Height"
      value={data.height}
      onChange={val => onChange('height', val)}
      min={50}
      max={300}
      error={errors.height}
      unit="cm"
    />
    <NumberStepper
      label="Weight"
      value={data.weight}
      onChange={val => onChange('weight', val)}
      min={20}
      max={500}
      error={errors.weight}
      unit="kg"
    />
    <div className="floating-label-group">
      <select
        value={data.gender}
        onChange={e => onChange('gender', e.target.value)}
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
);

export default PersonalDetails; 