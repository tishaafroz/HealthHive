import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaUtensils, FaCalendar, FaPlus, FaEdit } from 'react-icons/fa';
import '../styles/MealPlanner.css';

const MealPlanner = () => {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState(null);
  const [nutritionTargets, setNutritionTargets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateParams, setGenerateParams] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preferences: {}
  });

  const fetchCurrentMealPlan = useCallback(async () => {
    try {
      const response = await axios.get('/api/meals/plan/current');
      setMealPlan(response.data.data);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      // Set empty meal plan if API fails
      setMealPlan(null);
    }
  }, []);

  const fetchNutritionTargets = useCallback(async () => {
    // Only fetch if user is available
    if (!user || !user.id) {
      console.log('User not available yet, skipping nutrition targets fetch');
      return;
    }

    try {
      const response = await axios.get(`/api/meals/nutrition/targets/${user.id}`);
      setNutritionTargets(response.data.data);
    } catch (error) {
      console.error('Error fetching nutrition targets:', error);
      // Set default nutrition targets if API fails
      setNutritionTargets({
        dailyCalories: 2000,
        macros: {
          protein: { grams: 150, percentage: 30 },
          carbohydrates: { grams: 200, percentage: 40 },
          fat: { grams: 67, percentage: 30 }
        }
      });
    }
  }, [user]);

  useEffect(() => {
    fetchCurrentMealPlan();
  }, [fetchCurrentMealPlan]);

  // Fetch nutrition targets when user becomes available
  useEffect(() => {
    if (user && user.id) {
      fetchNutritionTargets();
    }
  }, [user, fetchNutritionTargets]);

  const generateMealPlan = async () => {
    if (!user || !user.id) {
      alert('Please log in to generate a meal plan.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/meals/plan/generate', {
        ...generateParams,
        userId: user.id
      });
      setMealPlan(response.data.data);
      setShowGenerateForm(false);
      fetchNutritionTargets(); // Refresh targets
    } catch (error) {
      console.error('Error generating meal plan:', error);
      alert('Error generating meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Show loading state while user is being fetched
  if (!user) {
    return (
      <div className="meal-planner">
        <div className="planner-header">
          <h2><FaUtensils /> Meal Planning & Nutrition</h2>
          <p>Loading user information...</p>
        </div>
        <div className="loading-state">
          <p>Please wait while we load your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="meal-planner">
      <div className="planner-header">
        <h2><FaUtensils /> Meal Planning & Nutrition</h2>
        <p>Generate personalized meal plans based on your health goals and preferences</p>
      </div>

      {!mealPlan ? (
        <div className="no-meal-plan">
          <div className="no-plan-content">
            <h3>No Active Meal Plan</h3>
            <p>Generate a personalized meal plan to get started with your nutrition journey.</p>
            <button 
              className="generate-plan-btn"
              onClick={() => setShowGenerateForm(true)}
            >
              <FaPlus /> Generate Meal Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="meal-plan-content">
          <div className="plan-overview">
            <div className="plan-header">
              <h3>{mealPlan.name || 'My Meal Plan'}</h3>
              <div className="plan-actions">
                <button className="edit-plan-btn">
                  <FaEdit /> Edit Plan
                </button>
                <button className="regenerate-plan-btn" onClick={() => setShowGenerateForm(true)}>
                  <FaPlus /> Regenerate
                </button>
              </div>
            </div>

            <div className="plan-dates">
              <span>
                <FaCalendar /> 
                {formatDate(mealPlan.startDate)} - {formatDate(mealPlan.endDate)}
              </span>
            </div>
          </div>

          {nutritionTargets && (
            <div className="nutrition-overview">
              <h4>Daily Nutrition Targets</h4>
              <div className="nutrition-grid">
                <div className="nutrition-card">
                  <div className="nutrition-header">Calories</div>
                  <div className="nutrition-value">
                    {nutritionTargets.dailyCalories || 'N/A'}
                  </div>
                  <div className="nutrition-unit">cal/day</div>
                </div>
                <div className="nutrition-card">
                  <div className="nutrition-header">Protein</div>
                  <div className="nutrition-value">
                    {nutritionTargets.macros?.protein?.grams || 'N/A'}g
                  </div>
                  <div className="nutrition-unit">
                    {nutritionTargets.macros?.protein?.percentage || 'N/A'}%
                  </div>
                </div>
                <div className="nutrition-card">
                  <div className="nutrition-header">Carbs</div>
                  <div className="nutrition-value">
                    {nutritionTargets.macros?.carbohydrates?.grams || 'N/A'}g
                  </div>
                  <div className="nutrition-unit">
                    {nutritionTargets.macros?.carbohydrates?.percentage || 'N/A'}%
                  </div>
                </div>
                <div className="nutrition-card">
                  <div className="nutrition-header">Fat</div>
                  <div className="nutrition-value">
                    {nutritionTargets.macros?.fat?.grams || 'N/A'}g
                  </div>
                  <div className="nutrition-unit">
                    {nutritionTargets.macros?.fat?.percentage || 'N/A'}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {mealPlan.meals && mealPlan.meals.length > 0 ? (
            <div className="meals-list">
              <h4>Your Meals</h4>
              {mealPlan.meals.map((meal, index) => (
                <div key={index} className="meal-item">
                  <div className="meal-header">
                    <h5>{meal.name || `Meal ${index + 1}`}</h5>
                    <span className="meal-time">{meal.time || 'TBD'}</span>
                  </div>
                  <div className="meal-foods">
                    {meal.foods && meal.foods.map((food, foodIndex) => (
                      <div key={foodIndex} className="food-item">
                        <span className="food-name">{food.name || 'Unknown Food'}</span>
                        <span className="food-portion">{food.portion || '1 serving'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-meals">
              <p>No meals planned yet. Generate a meal plan to get started!</p>
            </div>
          )}
        </div>
      )}

      {/* Generate Meal Plan Form */}
      {showGenerateForm && (
        <div className="generate-form-overlay">
          <div className="generate-form">
            <h3>Generate New Meal Plan</h3>
            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={generateParams.startDate}
                onChange={(e) => setGenerateParams(prev => ({
                  ...prev,
                  startDate: e.target.value
                }))}
              />
            </div>
            <div className="form-group">
              <label>End Date:</label>
              <input
                type="date"
                value={generateParams.endDate}
                onChange={(e) => setGenerateParams(prev => ({
                  ...prev,
                  endDate: e.target.value
                }))}
              />
            </div>
            <div className="form-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowGenerateForm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={generateMealPlan}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner; 