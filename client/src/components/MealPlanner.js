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
    }
  }, []);

  const fetchNutritionTargets = useCallback(async () => {
    try {
      const response = await axios.get(`/api/meals/nutrition/targets/${user.id}`);
      setNutritionTargets(response.data.data);
    } catch (error) {
      console.error('Error fetching nutrition targets:', error);
    }
  }, [user.id]);

  useEffect(() => {
    fetchCurrentMealPlan();
    fetchNutritionTargets();
  }, [fetchCurrentMealPlan, fetchNutritionTargets]);

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/meals/plan/generate', generateParams);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

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
              <h3>{mealPlan.name}</h3>
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
              <span><FaCalendar /> {formatDate(mealPlan.startDate)} - {formatDate(mealPlan.endDate)}</span>
            </div>
          </div>

          {nutritionTargets && (
            <div className="nutrition-overview">
              <h4>Daily Nutrition Targets</h4>
              <div className="nutrition-grid">
                <div className="nutrition-card">
                  <div className="nutrition-header">Calories</div>
                  <div className="nutrition-value">{nutritionTargets.dailyCalories}</div>
                  <div className="nutrition-unit">cal/day</div>
                </div>
                <div className="nutrition-card">
                  <div className="nutrition-header">Protein</div>
                  <div className="nutrition-value">{nutritionTargets.macros.protein.grams}g</div>
                  <div className="nutrition-unit">{nutritionTargets.macros.protein.percentage}%</div>
                </div>
                <div className="nutrition-card">
                  <div className="nutrition-header">Carbs</div>
                  <div className="nutrition-value">{nutritionTargets.macros.carbohydrates.grams}g</div>
                  <div className="nutrition-unit">{nutritionTargets.macros.carbohydrates.percentage}%</div>
                </div>
                <div className="nutrition-card">
                  <div className="nutrition-header">Fat</div>
                  <div className="nutrition-value">{nutritionTargets.macros.fat.grams}g</div>
                  <div className="nutrition-unit">{nutritionTargets.macros.fat.percentage}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showGenerateForm && (
        <div className="generate-form-overlay">
          <div className="generate-form">
            <h3>Generate New Meal Plan</h3>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={generateParams.startDate}
                onChange={(e) => setGenerateParams(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={generateParams.endDate}
                onChange={(e) => setGenerateParams(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="form-actions">
              <button onClick={generateMealPlan} disabled={loading} className="generate-btn">
                {loading ? 'Generating...' : 'Generate Plan'}
              </button>
              <button onClick={() => setShowGenerateForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner; 