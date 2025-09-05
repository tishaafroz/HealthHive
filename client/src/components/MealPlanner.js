import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { 
  FaUtensils, 
  FaCalendar, 
  FaPlus, 
  FaTimes, 
  FaSpinner,
  FaClock,
  FaFire,
  FaLeaf,
  FaHeart,
  FaAppleAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRedo
} from 'react-icons/fa';
import '../styles/MealPlanner.css';

const MealPlanner = () => {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generateParams, setGenerateParams] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preferences: {
      calorieTarget: 2000,
      dietaryRestrictions: [],
      cuisinePreferences: [],
      excludedIngredients: [],
      mealsPerDay: 3
    }
  });

  // Clear messages after timeout
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchCurrentMealPlan = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      const response = await api.get('/api/meals/plan/current');
      console.log('Current meal plan response:', response.data);
      
      // Handle the response structure from backend
      if (response.data.success && response.data.data) {
        setMealPlan(response.data.data.mealPlan || response.data.data);
      } else {
        setMealPlan(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      if (error.response?.status !== 404) {
        setError('Failed to load your meal plan. Please try again.');
      }
      setMealPlan(null);
    }
  }, [user]);

  useEffect(() => {
    fetchCurrentMealPlan();
  }, [fetchCurrentMealPlan]);

  const generateMealPlan = async () => {
    if (!user) {
      setError('Please log in to generate a meal plan.');
      return;
    }

    // Validate form inputs
    if (!generateParams.startDate || !generateParams.endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    const startDate = new Date(generateParams.startDate);
    const endDate = new Date(generateParams.endDate);
    
    if (endDate <= startDate) {
      setError('End date must be after start date.');
      return;
    }

    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      setError('Meal plans can be generated for a maximum of 30 days.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const requestData = {
        ...generateParams,
        duration: daysDiff
      };

      const response = await api.post('/api/meals/plan/generate', requestData);
      
      console.log('Meal plan response:', response.data);
      setMealPlan(response.data.data || response.data);
      setShowGenerateForm(false);
      setSuccess(`Meal plan generated successfully for ${daysDiff} days!`);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate meal plan. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateParamsChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setGenerateParams(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
        }
      }));
    } else {
      setGenerateParams(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleArrayChange = (arrayName, value, checked) => {
    setGenerateParams(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [arrayName]: checked 
          ? [...(prev.preferences[arrayName] || []), value]
          : (prev.preferences[arrayName] || []).filter(item => item !== value)
      }
    }));
  };

  return (
    <div className="meal-planner">
      {/* Notification Messages */}
      {error && (
        <div className="notification error">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-notification">
            <FaTimes />
          </button>
        </div>
      )}
      
      {success && (
        <div className="notification success">
          <FaCheckCircle />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="close-notification">
            <FaTimes />
          </button>
        </div>
      )}

      <div className="meal-planner-header">
        <h1><FaUtensils /> Smart Meal Planner</h1>
        <p>Create personalized meal plans tailored to your nutritional goals and preferences</p>
        
        {!mealPlan && !showGenerateForm && (
          <button 
            className="generate-button primary"
            onClick={() => setShowGenerateForm(true)}
            disabled={loading}
          >
            <FaPlus /> Generate Your First Meal Plan
          </button>
        )}
      </div>

      {/* Enhanced Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">
            <FaSpinner />
          </div>
          <h3>Creating Your Meal Plan</h3>
          <p>This may take a few moments while we craft the perfect meals for you...</p>
          <div className="loading-steps">
            <div className="step active">
              <FaAppleAlt /> Analyzing your preferences
            </div>
            <div className="step">
              <FaHeart /> Finding nutritious recipes
            </div>
            <div className="step">
              <FaLeaf /> Balancing your nutrition
            </div>
            <div className="step">
              <FaCheckCircle /> Finalizing your plan
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Generate Form */}
      {showGenerateForm && (
        <div className="generate-form-overlay">
          <div className="generate-form">
            <div className="form-header">
              <h3><FaUtensils /> Create Your Meal Plan</h3>
              <button 
                className="close-button"
                onClick={() => setShowGenerateForm(false)}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <div className="form-content">
              {/* Date Selection */}
              <div className="form-section">
                <h4><FaCalendar /> Plan Duration</h4>
                <div className="date-inputs">
                  <div className="form-group">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      name="startDate"
                      value={generateParams.startDate}
                      onChange={handleGenerateParamsChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date:</label>
                    <input
                      type="date"
                      name="endDate"
                      value={generateParams.endDate}
                      onChange={handleGenerateParamsChange}
                      min={generateParams.startDate}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Nutritional Goals */}
              <div className="form-section">
                <h4><FaFire /> Nutritional Goals</h4>
                <div className="nutrition-inputs">
                  <div className="form-group">
                    <label>Daily Calorie Target:</label>
                    <input
                      type="number"
                      name="preferences.calorieTarget"
                      value={generateParams.preferences.calorieTarget}
                      onChange={handleGenerateParamsChange}
                      min="1200"
                      max="4000"
                      step="50"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Meals Per Day:</label>
                    <select
                      name="preferences.mealsPerDay"
                      value={generateParams.preferences.mealsPerDay}
                      onChange={handleGenerateParamsChange}
                      className="form-select"
                    >
                      <option value={3}>3 Meals</option>
                      <option value={4}>4 Meals</option>
                      <option value={5}>5 Meals</option>
                      <option value={6}>6 Meals</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div className="form-section">
                <h4><FaLeaf /> Dietary Preferences</h4>
                <div className="checkbox-grid">
                  {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb', 'low-fat'].map(diet => (
                    <label key={diet} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={generateParams.preferences.dietaryRestrictions?.includes(diet)}
                        onChange={(e) => handleArrayChange('dietaryRestrictions', diet, e.target.checked)}
                      />
                      <span className="checkbox-label">{diet.charAt(0).toUpperCase() + diet.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cuisine Preferences */}
              <div className="form-section">
                <h4>🌍 Cuisine Preferences</h4>
                <div className="checkbox-grid">
                  {['italian', 'mediterranean', 'asian', 'mexican', 'indian', 'american', 'middle-eastern', 'french'].map(cuisine => (
                    <label key={cuisine} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={generateParams.preferences.cuisinePreferences?.includes(cuisine)}
                        onChange={(e) => handleArrayChange('cuisinePreferences', cuisine, e.target.checked)}
                      />
                      <span className="checkbox-label">{cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button"
                className="cancel-button"
                onClick={() => setShowGenerateForm(false)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="generate-button primary"
                onClick={generateMealPlan} 
                disabled={loading}
              >
                {loading ? <FaSpinner /> : <FaPlus />}
                {loading ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Meal Plan Display */}
      {mealPlan && mealPlan.dailyPlans && (
        <div className="meal-plan">
          <div className="meal-plan-header">
            <div className="plan-title-section">
              <h3>Your Personalized Meal Plan</h3>
              <div className="plan-stats">
                <div className="stat-item">
                  <FaCalendar />
                  <span>{mealPlan.dailyPlans.length} Days</span>
                </div>
                <div className="stat-item">
                  <FaFire />
                  <span>{mealPlan.preferences?.calorieTarget || 'N/A'} cal/day</span>
                </div>
                <div className="stat-item">
                  <FaClock />
                  <span>
                    {new Date(mealPlan.startDate).toLocaleDateString()} - {new Date(mealPlan.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="plan-actions">
              <button 
                className="action-button secondary"
                onClick={() => setShowGenerateForm(true)}
                title="Generate new plan"
              >
                <FaRedo /> New Plan
              </button>
            </div>
          </div>
          
          <div className="daily-plans-container">
            {mealPlan.dailyPlans.map((day, dayIndex) => (
              <div key={day.date || dayIndex} className="meal-day">
                <div className="day-header">
                  <div className="day-title">
                    <h4>
                      <FaCalendar /> {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h4>
                    <div className="day-summary">
                      <span className="total-calories">
                        <FaFire /> {day.totalNutrition?.calories || 0} calories
                      </span>
                    </div>
                  </div>
                  
                  <div className="day-nutrition">
                    <div className="nutrition-item calories">
                      <FaFire />
                      <span><strong>{day.totalNutrition?.calories || 0}</strong> cal</span>
                    </div>
                    <div className="nutrition-item protein">
                      <span><strong>{day.totalNutrition?.protein || 0}g</strong> protein</span>
                    </div>
                    <div className="nutrition-item carbs">
                      <span><strong>{day.totalNutrition?.carbohydrates || 0}g</strong> carbs</span>
                    </div>
                    <div className="nutrition-item fat">
                      <span><strong>{day.totalNutrition?.fat || 0}g</strong> fat</span>
                    </div>
                  </div>
                </div>
                
                <div className="meals-grid">
                  {day.meals && day.meals.map((meal, mealIndex) => (
                    <div key={meal._id || `${dayIndex}-${mealIndex}`} className="meal-card">
                      <div className="meal-header">
                        <div className="meal-type-badge">{meal.mealType}</div>
                        <div className="meal-time">
                          <FaClock /> {meal.timeSlot}
                        </div>
                      </div>
                      
                      <div className="meal-content">
                        <h5>{meal.food?.name || 'Meal Item'}</h5>
                        <div className="meal-details">
                          <div className="quantity-info">
                            <span>Quantity: {meal.quantity} {meal.unit}</span>
                          </div>
                          {meal.food?.nutrition && (
                            <div className="meal-nutrition">
                              <span className="nutrition-detail">
                                <FaFire /> {meal.food.nutrition.calories}cal
                              </span>
                              <span className="nutrition-detail">
                                🥩 {meal.food.nutrition.protein}g
                              </span>
                              <span className="nutrition-detail">
                                🍞 {meal.food.nutrition.carbohydrates}g
                              </span>
                              <span className="nutrition-detail">
                                🥑 {meal.food.nutrition.fat}g
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Enhanced Progress Bars */}
                <div className="nutrition-progress">
                  <h5>Daily Nutrition Progress</h5>
                  <div className="progress-grid">
                    <div className="progress-item">
                      <label>Calories</label>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill calories" 
                          style={{ width: `${Math.min(day.nutritionProgress?.calories || 0, 100)}%` }}
                        ></div>
                      </div>
                      <span>{day.nutritionProgress?.calories || 0}%</span>
                    </div>
                    <div className="progress-item">
                      <label>Protein</label>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill protein" 
                          style={{ width: `${Math.min(day.nutritionProgress?.protein || 0, 100)}%` }}
                        ></div>
                      </div>
                      <span>{day.nutritionProgress?.protein || 0}%</span>
                    </div>
                    <div className="progress-item">
                      <label>Carbs</label>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill carbs" 
                          style={{ width: `${Math.min(day.nutritionProgress?.carbohydrates || 0, 100)}%` }}
                        ></div>
                      </div>
                      <span>{day.nutritionProgress?.carbohydrates || 0}%</span>
                    </div>
                    <div className="progress-item">
                      <label>Fat</label>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill fat" 
                          style={{ width: `${Math.min(day.nutritionProgress?.fat || 0, 100)}%` }}
                        ></div>
                      </div>
                      <span>{day.nutritionProgress?.fat || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="meal-plan-actions">
            <button 
              className="regenerate-button"
              onClick={() => setShowGenerateForm(true)}
            >
              <FaPlus /> Generate New Plan
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Empty State */}
      {!mealPlan && !loading && !showGenerateForm && (
        <div className="no-meal-plan">
          <div className="empty-state">
            <div className="empty-icon-container">
              <FaUtensils className="empty-icon primary" />
              <FaCalendar className="empty-icon secondary" />
              <FaHeart className="empty-icon accent" />
            </div>
            <h3>Ready to Start Your Health Journey?</h3>
            <p>Create a personalized meal plan that fits your lifestyle, dietary preferences, and nutritional goals. Our AI-powered system will craft the perfect meals for you!</p>
            
            <div className="benefits-grid">
              <div className="benefit-item">
                <FaFire />
                <span>Calorie Tracking</span>
              </div>
              <div className="benefit-item">
                <FaLeaf />
                <span>Dietary Preferences</span>
              </div>
              <div className="benefit-item">
                <FaAppleAlt />
                <span>Nutritious Recipes</span>
              </div>
              <div className="benefit-item">
                <FaHeart />
                <span>Health Goals</span>
              </div>
            </div>
            
            <button 
              className="generate-button primary large"
              onClick={() => setShowGenerateForm(true)}
            >
              <FaPlus /> Create Your First Meal Plan
            </button>
            
            <div className="quick-stats">
              <div className="stat">
                <strong>1000+</strong>
                <span>Healthy Recipes</span>
              </div>
              <div className="stat">
                <strong>AI-Powered</strong>
                <span>Meal Planning</span>
              </div>
              <div className="stat">
                <strong>Personalized</strong>
                <span>Nutrition Goals</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
