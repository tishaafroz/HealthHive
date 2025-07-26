import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await register(formData);
      console.log('Register result:', result); // Log the result for debugging

      if (result && result.success) {
        navigate('/login');
      } else {
        setError(result?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card register-container">
        <h2>Register for HealthHive</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="register-username">Username:</label>
            <input
              id="register-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="auth-input"
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-email">Email:</label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-input"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-firstName">First Name:</label>
            <input
              id="register-firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="auth-input"
              autoComplete="given-name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-lastName">Last Name:</label>
            <input
              id="register-lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="auth-input"
              autoComplete="family-name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Password:</label>
            <input
              id="register-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="auth-btn">Register</button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;