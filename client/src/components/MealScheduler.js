import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';

const MealScheduler = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [newMeal, setNewMeal] = useState({
    mealType: 'breakfast',
    mealName: '',
    scheduledTime: '',
    calories: '',
    ingredients: '',
    notes: ''
  });
  const [editingMeal, setEditingMeal] = useState(null);

  useEffect(() => {
    loadMeals(selectedDate);
  }, [selectedDate]);

  const loadMeals = async (date) => {
    try {
      const response = await axios.get(`/api/meals/schedule/${format(date, 'yyyy-MM-dd')}`);
      setMeals(response.data);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingMeal) {
      setEditingMeal({
        ...editingMeal,
        [name]: value
      });
    } else {
      setNewMeal({
        ...newMeal,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const mealData = {
        ...(editingMeal || newMeal),
        ingredients: (editingMeal || newMeal).ingredients.split(',').map(i => i.trim()),
        scheduledTime: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${(editingMeal || newMeal).scheduledTime}`)
      };

      if (editingMeal) {
        await axios.put(`/api/meals/schedule/${editingMeal._id}`, mealData);
      } else {
        await axios.post('/api/meals/schedule', mealData);
      }

      loadMeals(selectedDate);
      setNewMeal({
        mealType: 'breakfast',
        mealName: '',
        scheduledTime: '',
        calories: '',
        ingredients: '',
        notes: ''
      });
      setEditingMeal(null);
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  const handleDelete = async (mealId) => {
    try {
      await axios.delete(`/api/meals/schedule/${mealId}`);
      loadMeals(selectedDate);
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleEdit = (meal) => {
    setEditingMeal({
      ...meal,
      ingredients: meal.ingredients.join(', '),
      scheduledTime: format(new Date(meal.scheduledTime), 'HH:mm')
    });
  };

  const handleComplete = async (mealId) => {
    try {
      await axios.post(`/api/meals/schedule/${mealId}/complete`);
      loadMeals(selectedDate);
    } catch (error) {
      console.error('Error completing meal:', error);
    }
  };

  const handleFindAlternatives = async (mealId) => {
    try {
      const response = await axios.get(`/api/meals/schedule/${mealId}/alternatives`);
      // Handle alternatives display (could show in a modal or dropdown)
      console.log('Alternatives:', response.data);
    } catch (error) {
      console.error('Error finding alternatives:', error);
    }
  };

  return (
    <div className="meal-scheduler">
      <div className="meal-scheduler__calendar">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
        />
      </div>

      <div className="meal-scheduler__form">
        <h3>{editingMeal ? 'Edit Meal' : 'Add New Meal'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Meal Type:</label>
            <select
              name="mealType"
              value={(editingMeal || newMeal).mealType}
              onChange={handleInputChange}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div className="form-group">
            <label>Meal Name:</label>
            <input
              type="text"
              name="mealName"
              value={(editingMeal || newMeal).mealName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Time:</label>
            <input
              type="time"
              name="scheduledTime"
              value={(editingMeal || newMeal).scheduledTime}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Calories:</label>
            <input
              type="number"
              name="calories"
              value={(editingMeal || newMeal).calories}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Ingredients (comma-separated):</label>
            <input
              type="text"
              name="ingredients"
              value={(editingMeal || newMeal).ingredients}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Notes:</label>
            <textarea
              name="notes"
              value={(editingMeal || newMeal).notes}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit">{editingMeal ? 'Update' : 'Add'} Meal</button>
          {editingMeal && (
            <button type="button" onClick={() => setEditingMeal(null)}>Cancel</button>
          )}
        </form>
      </div>

      <div className="meal-scheduler__list">
        <h3>Scheduled Meals for {format(selectedDate, 'MMMM d, yyyy')}</h3>
        {meals.map(meal => (
          <div key={meal._id} className="meal-card">
            <div className="meal-card__header">
              <h4>{meal.mealName}</h4>
              <span>{format(new Date(meal.scheduledTime), 'h:mm a')}</span>
            </div>
            <div className="meal-card__body">
              <p>Type: {meal.mealType}</p>
              <p>Calories: {meal.calories}</p>
              <p>Ingredients: {meal.ingredients.join(', ')}</p>
              {meal.notes && <p>Notes: {meal.notes}</p>}
            </div>
            <div className="meal-card__actions">
              {!meal.isCompleted && (
                <>
                  <button onClick={() => handleComplete(meal._id)}>Complete</button>
                  <button onClick={() => handleEdit(meal)}>Edit</button>
                  <button onClick={() => handleFindAlternatives(meal._id)}>Find Alternatives</button>
                </>
              )}
              <button onClick={() => handleDelete(meal._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealScheduler;
