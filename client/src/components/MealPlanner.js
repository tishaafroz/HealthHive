import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { FaUtensils, FaCalendar, FaPlus, FaEdit } from 'react-icons/fa';
import '../styles/MealPlanner.css';

const MealPlanner = () => {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateParams, setGenerateParams] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preferences: {}
  });

  const fetchCurrentMealPlan = useCallback(async () => {
    if (!user) return;

    try {
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
      setMealPlan(null);
    }
  }, [user]);

  useEffect(() => {
    fetchCurrentMealPlan();
  }, [fetchCurrentMealPlan]);

  const generateMealPlan = async () => {
    if (!user) {
      alert('Please log in to generate a meal plan.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/meals/plan/generate', generateParams);
      
      // Handle the response structure from backend
      console.log('Meal plan response:', response.data);
      setMealPlan(response.data.data || response.data);
      setShowGenerateForm(false);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      alert('Failed to generate meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateParamsChange = (e) => {
    const { name, value } = e.target;
    setGenerateParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="meal-planner">
      <div className="meal-planner-header">
        <h2><FaUtensils /> Meal Planner</h2>
        {!mealPlan && (
          <button 
            className="generate-button"
            onClick={() => setShowGenerateForm(true)}
            disabled={loading}
          >
            <FaPlus /> Generate Meal Plan
          </button>
        )}
      </div>

      {loading && <div className="loading">Generating your meal plan...</div>}

      {showGenerateForm && (
        <div className="generate-form">
          <h3>Generate Meal Plan</h3>
          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="date"
              name="startDate"
              value={generateParams.startDate}
              onChange={handleGenerateParamsChange}
            />
          </div>
          <div className="form-group">
            <label>End Date:</label>
            <input
              type="date"
              name="endDate"
              value={generateParams.endDate}
              onChange={handleGenerateParamsChange}
            />
          </div>
          <div className="form-actions">
            <button onClick={() => setShowGenerateForm(false)}>Cancel</button>
            <button onClick={generateMealPlan} disabled={loading}>
              Generate
            </button>
          </div>
        </div>
      )}

      {mealPlan && mealPlan.dailyPlans && (
        <div className="meal-plan">
          <div className="meal-plan-header">
            <h3>Your Meal Plan</h3>
            <div className="plan-info">
              <span className="plan-duration">
                {new Date(mealPlan.startDate).toLocaleDateString()} - {new Date(mealPlan.endDate).toLocaleDateString()}
              </span>
              <span className="plan-calories">
                Target: {mealPlan.preferences?.calorieTarget || 'N/A'} calories/day
              </span>
            </div>
          </div>
          
          {mealPlan.dailyPlans.map((day, dayIndex) => (
            <div key={day.date || dayIndex} className="meal-day">
              <div className="day-header">
                <h4>
                  <FaCalendar /> {new Date(day.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                <div className="day-nutrition">
                  <span className="nutrition-item">
                    <strong>{day.totalNutrition?.calories || 0}</strong> cal
                  </span>
                  <span className="nutrition-item">
                    <strong>{day.totalNutrition?.protein || 0}g</strong> protein
                  </span>
                  <span className="nutrition-item">
                    <strong>{day.totalNutrition?.carbohydrates || 0}g</strong> carbs
                  </span>
                  <span className="nutrition-item">
                    <strong>{day.totalNutrition?.fat || 0}g</strong> fat
                  </span>
                </div>
              </div>
              
              <div className="meals-grid">
                {day.meals && day.meals.map((meal, mealIndex) => (
                  <div key={meal._id || `${dayIndex}-${mealIndex}`} className="meal-card">
                    <div className="meal-header">
                      <div className="meal-type-badge">{meal.mealType}</div>
                      <div className="meal-time">{meal.timeSlot}</div>
                    </div>
                    
                    <div className="meal-content">
                      <h5>{meal.food?.name || 'Meal Item'}</h5>
                      <div className="meal-details">
                        <span>Quantity: {meal.quantity} {meal.unit}</span>
                      </div>
                    </div>
                    
                    <div className="meal-actions">
                      <button
                        className="edit-button"
                        onClick={() => {
                          // Edit functionality can be added here
                        }}
                        title="Edit meal"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="nutrition-progress">
                <div className="progress-item">
                  <label>Calories</label>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
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
          ))}
          
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

      {!mealPlan && !loading && !showGenerateForm && (
        <div className="no-meal-plan">
          <div className="empty-state">
            <FaUtensils className="empty-icon" />
            <h3>No Meal Plan Yet</h3>
            <p>Generate your first meal plan to get started with organized eating!</p>
            <button 
              className="generate-button primary"
              onClick={() => setShowGenerateForm(true)}
            >
              <FaPlus /> Create Meal Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
