import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaCalculator, FaLightbulb, FaHistory } from 'react-icons/fa';
import '../styles/BMICalculator.css'; // ✅ Fixed import path

const BMICalculator = () => {
  const { user } = useAuth();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [bmiHistory, setBmiHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user?.height && user?.weight) {
      setHeight(user.height.toString());
      setWeight(user.weight.toString());
    }
    fetchBMIHistory();
    fetchRecommendations();
  }, [user]);

  const fetchBMIHistory = async () => {
    try {
      const response = await axios.get('/api/health/bmi/history?limit=10');
      setBmiHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching BMI history:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('/api/health/recommendations');
      setRecommendations(response.data.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const calculateBMI = async () => {
    if (!height || !weight) {
      alert('Please enter both height and weight');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/health/bmi/calculate', {
        height: parseFloat(height),
        weight: parseFloat(weight)
      });

      const { bmi, category, status, recommendations } = response.data.data;
      setBmi(bmi);
      setBmiCategory(category);
      setHealthStatus(status);
      setRecommendations(recommendations);
      
      // Refresh history
      fetchBMIHistory();
      
    } catch (error) {
      console.error('Error calculating BMI:', error);
      alert('Error calculating BMI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBMIColor = (category) => {
    const colors = {
      underweight: '#FFB74D',
      normal: '#4CAF50',
      overweight: '#FF9800',
      obese: '#F44336'
    };
    return colors[category] || '#757575';
  };

  const getStatusIcon = (status) => {
    const icons = {
      excellent: '🌟',
      good: '👍',
      fair: '⚠️',
      poor: '💩'
    };
    return icons[status] || '❓';
  };

  return (
    <div className="bmi-calculator">
      <div className="bmi-header">
        <h2><FaCalculator /> BMI Calculator & Health Assessment</h2>
        <p>Track your Body Mass Index and get personalized health recommendations</p>
      </div>

      <div className="bmi-main">
        <div className="bmi-input-section">
          <div className="input-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              type="number"
              id="height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g., 170"
              min="50"
              max="300"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 70"
              min="20"
              max="500"
            />
          </div>

          <button 
            className="calculate-btn"
            onClick={calculateBMI}
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate BMI'}
          </button>
        </div>

        {bmi && (
          <div className="bmi-results">
            <div className="bmi-display">
              <div className="bmi-number" style={{ color: getBMIColor(bmiCategory) }}>
                {bmi}
              </div>
              <div className="bmi-category" style={{ backgroundColor: getBMIColor(bmiCategory) }}>
                {bmiCategory.charAt(0).toUpperCase() + bmiCategory.slice(1)}
              </div>
              <div className="health-status">
                {getStatusIcon(healthStatus)} {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)} Health
              </div>
            </div>

            <div className="bmi-info">
              <h3>What this means:</h3>
              <p>
                Your BMI of <strong>{bmi}</strong> indicates you are in the 
                <strong> {bmiCategory}</strong> category. This suggests 
                {bmiCategory === 'normal' ? ' you are at a healthy weight.' : 
                 bmiCategory === 'underweight' ? ' you may need to gain some weight.' :
                 bmiCategory === 'overweight' ? ' you may benefit from weight management.' :
                 ' you should consult with healthcare professionals.'}
              </p>
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="recommendations">
            <h3><FaLightbulb /> Personalized Recommendations</h3>
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bmi-history">
        <div className="history-header">
          <h3><FaHistory /> BMI History</h3>
          <button 
            className="toggle-history-btn"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>

        {showHistory && (
          <div className="history-content">
            {bmiHistory.length > 0 ? (
              <div className="history-chart">
                <div className="chart-container">
                  {bmiHistory.slice(0, 7).reverse().map((record, index) => (
                    <div key={record._id} className="chart-bar">
                      <div 
                        className="bar-fill"
                        style={{ 
                          height: `${(record.bmi / 40) * 100}%`,
                          backgroundColor: getBMIColor(record.bmiCategory)
                        }}
                      ></div>
                      <div className="bar-label">
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="chart-legend">
                  <span>BMI Range: 18.5 - 24.9 (Normal)</span>
                </div>
              </div>
            ) : (
              <p>No BMI history available. Calculate your BMI to start tracking!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BMICalculator;
 