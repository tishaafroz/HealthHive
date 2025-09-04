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
      setMealPlan(response.data);
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
      
      setMealPlan(response.data);
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

      {mealPlan && mealPlan.days && (
        <div className="meal-plan">
          {mealPlan.days.map((day, dayIndex) => (
            <div key={day.date} className="meal-day">
              <h3>
                <FaCalendar /> {new Date(day.date).toLocaleDateString()}
              </h3>
              <div className="meals">
                {day.meals.map((meal, mealIndex) => (
                  <div key={`${dayIndex}-${mealIndex}`} className="meal-card">
                    <div className="meal-header">
                      <h4>{meal.name}</h4>
                      <button
                        className="edit-button"
                        onClick={() => {
                          // Edit functionality can be added here
                        }}
                      >
                        <FaEdit />
                      </button>
                    </div>
                    {meal.image && <img src={meal.image} alt={meal.name} />}
                    <div className="meal-details">
                      <p>Calories: {meal.calories}kcal</p>
                      <p>Protein: {meal.protein}g</p>
                      <p>Carbs: {meal.carbs}g</p>
                      <p>Fat: {meal.fat}g</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
