import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  FaCalculator, 
  FaLightbulb, 
  FaHistory, 
  FaWeight, 
  FaRuler, 
  FaHeart, 
  FaChartLine,
  FaTrophy,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from 'react-icons/fa';
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

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    // Validate input ranges
    if (heightNum < 50 || heightNum > 300) {
      alert('Height must be between 50-300 cm');
      return;
    }

    if (weightNum < 20 || weightNum > 500) {
      alert('Weight must be between 20-500 kg');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/health/bmi/calculate', {
        height: heightNum,
        weight: weightNum
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
      
      let errorMessage = 'Error calculating BMI. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }
      
      alert(errorMessage);
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
        <div className="header-content">
          <div className="header-text">
            <h2><FaCalculator /> BMI Calculator & Health Assessment</h2>
            <p>Track your Body Mass Index and get personalized health recommendations</p>
          </div>
          <div className="header-stats">
            <div className="quick-stat">
              <FaHeart className="stat-icon" />
              <span>Health Tracker</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bmi-container">
        {/* Enhanced Input Section */}
        <div className="bmi-input-card">
          <div className="card-header">
            <h3><FaWeight /> Enter Your Measurements</h3>
            <p>Input your current height and weight for accurate BMI calculation</p>
          </div>
          
          <div className="input-grid">
            <div className="input-group enhanced">
              <label htmlFor="height">
                <FaRuler className="input-icon" />
                Height (cm)
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  id="height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 170"
                  min="50"
                  max="300"
                  className="enhanced-input"
                />
                <span className="input-unit">cm</span>
              </div>
            </div>
            
            <div className="input-group enhanced">
              <label htmlFor="weight">
                <FaWeight className="input-icon" />
                Weight (kg)
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 70"
                  min="20"
                  max="500"
                  className="enhanced-input"
                />
                <span className="input-unit">kg</span>
              </div>
            </div>
          </div>

          <button 
            className="calculate-btn enhanced"
            onClick={calculateBMI}
            disabled={loading}
          >
            <FaCalculator />
            {loading ? 'Calculating...' : 'Calculate BMI'}
            {!loading && <FaChartLine className="btn-arrow" />}
          </button>
        </div>

        {/* Enhanced Results Section */}
        {bmi && (
          <div className="bmi-results-card">
            <div className="card-header">
              <h3>Your BMI Results</h3>
              <div className="result-badge" style={{ backgroundColor: getBMIColor(bmiCategory) }}>
                {getStatusIcon(healthStatus)} {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
              </div>
            </div>

            <div className="bmi-display-enhanced">
              <div className="bmi-circle" style={{ borderColor: getBMIColor(bmiCategory) }}>
                <div className="bmi-number" style={{ color: getBMIColor(bmiCategory) }}>
                  {bmi}
                </div>
                <div className="bmi-label">BMI</div>
              </div>
              
              <div className="bmi-details">
                <div className="category-display">
                  <div className="category-badge" style={{ backgroundColor: getBMIColor(bmiCategory) }}>
                    {bmiCategory.charAt(0).toUpperCase() + bmiCategory.slice(1)}
                  </div>
                  {bmiHistory.length > 1 && (
                    <div className="trend-indicator">
                      {bmiHistory[0].bmi > bmiHistory[1].bmi ? (
                        <FaArrowUp className="trend-up" />
                      ) : bmiHistory[0].bmi < bmiHistory[1].bmi ? (
                        <FaArrowDown className="trend-down" />
                      ) : (
                        <FaMinus className="trend-stable" />
                      )}
                    </div>
                  )}
                </div>

                <div className="bmi-range-indicator">
                  <div className="range-bar">
                    <div className="range-segment underweight"></div>
                    <div className="range-segment normal"></div>
                    <div className="range-segment overweight"></div>
                    <div className="range-segment obese"></div>
                    <div 
                      className="current-indicator" 
                      style={{ 
                        left: `${Math.min(Math.max((bmi - 15) / 25 * 100, 0), 100)}%`,
                        backgroundColor: getBMIColor(bmiCategory)
                      }}
                    ></div>
                  </div>
                  <div className="range-labels">
                    <span>15</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>40</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bmi-interpretation">
              <div className="interpretation-card">
                <h4>What this means:</h4>
                <p>
                  Your BMI of <strong>{bmi}</strong> indicates you are in the 
                  <strong> {bmiCategory}</strong> category. This suggests 
                  {bmiCategory === 'normal' ? ' you are at a healthy weight. Keep up the good work!' : 
                   bmiCategory === 'underweight' ? ' you may need to gain some weight. Consider consulting a healthcare professional.' :
                   bmiCategory === 'overweight' ? ' you may benefit from weight management. Focus on a balanced diet and regular exercise.' :
                   ' you should consult with healthcare professionals for a comprehensive health plan.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Recommendations */}
        {recommendations.length > 0 && (
          <div className="recommendations-card">
            <div className="card-header">
              <h3><FaLightbulb /> Personalized Recommendations</h3>
              <div className="recommendations-count">
                <FaTrophy /> {recommendations.length} Tips
              </div>
            </div>
            <div className="recommendations-grid">
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <div className="rec-icon">
                    {index % 4 === 0 ? <FaHeart /> : 
                     index % 4 === 1 ? <FaWeight /> :
                     index % 4 === 2 ? <FaRuler /> : <FaTrophy />}
                  </div>
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced History Section */}
        <div className="bmi-history-card">
          <div className="card-header">
            <h3><FaHistory /> BMI Progress Tracking</h3>
            <button 
              className="toggle-history-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide Progress' : 'View Progress'}
              <FaChartLine />
            </button>
          </div>

          {showHistory && (
            <div className="history-content-enhanced">
              {bmiHistory.length > 0 ? (
                <>
                  <div className="history-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Records</span>
                      <span className="stat-value">{bmiHistory.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Latest BMI</span>
                      <span className="stat-value">{bmiHistory[0]?.bmi}</span>
                    </div>
                    {bmiHistory.length > 1 && (
                      <div className="stat-item">
                        <span className="stat-label">Change</span>
                        <span className={`stat-value ${bmiHistory[0].bmi > bmiHistory[1].bmi ? 'trend-up' : 'trend-down'}`}>
                          {bmiHistory[0].bmi > bmiHistory[1].bmi ? '+' : ''}{(bmiHistory[0].bmi - bmiHistory[1].bmi).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="history-chart-enhanced">
                    <div className="chart-container">
                      {bmiHistory.slice(0, 7).reverse().map((record, index) => (
                        <div key={record._id} className="chart-bar-enhanced">
                          <div className="bar-info">
                            <span className="bar-value">{record.bmi}</span>
                          </div>
                          <div 
                            className="bar-fill"
                            style={{ 
                              height: `${Math.max((record.bmi / 40) * 100, 10)}%`,
                              backgroundColor: getBMIColor(record.bmiCategory)
                            }}
                          ></div>
                          <div className="bar-label">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="chart-legend-enhanced">
                      <div className="legend-item">
                        <span className="legend-color underweight"></span>
                        <span>Underweight (&lt;18.5)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color normal"></span>
                        <span>Normal (18.5-24.9)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color overweight"></span>
                        <span>Overweight (25-29.9)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color obese"></span>
                        <span>Obese (≥30)</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-history">
                  <FaExclamationTriangle className="no-history-icon" />
                  <h4>No BMI history available</h4>
                  <p>Calculate your BMI to start tracking your progress!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;
 