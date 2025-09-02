import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaClock, FaUtensils, FaHeart, FaRegHeart } from 'react-icons/fa';

const Recipe = ({ recipe, onInteraction }) => {
  const [saved, setSaved] = useState(false);
  const [rating, setRating] = useState(0);
  
  useEffect(() => {
    checkSavedStatus();
  }, []);
  
  const checkSavedStatus = async () => {
    try {
      const response = await axios.get(`/api/recipes/${recipe._id}/interaction`);
      setSaved(!!response.data.data?.actions?.saved);
      setRating(response.data.data?.personalRating || 0);
    } catch (error) {
      console.error('Error checking recipe status:', error);
    }
  };
  
  const handleSave = async () => {
    try {
      await axios.post(`/api/recipes/${recipe._id}/interaction`, {
        action: 'save'
      });
      setSaved(!saved);
      if (onInteraction) onInteraction('save', !saved);
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };
  
  const handleRate = async (value) => {
    try {
      await axios.post(`/api/recipes/${recipe._id}/interaction`, {
        action: 'rate',
        data: { rating: value }
      });
      setRating(value);
      if (onInteraction) onInteraction('rate', value);
    } catch (error) {
      console.error('Error rating recipe:', error);
    }
  };
  
  const renderStars = () => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`cursor-pointer ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        onClick={() => handleRate(index + 1)}
      />
    ));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {recipe.images?.[0] && (
        <div className="h-48 overflow-hidden">
          <img
            src={recipe.images[0].url}
            alt={recipe.images[0].alt || recipe.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{recipe.name}</h3>
          <button
            onClick={handleSave}
            className="text-red-500 hover:text-red-600 focus:outline-none"
          >
            {saved ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
        
        <p className="text-gray-600 text-sm mb-3">{recipe.description}</p>
        
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center">
            <FaClock className="text-gray-500 mr-1" />
            <span className="text-sm text-gray-500">{recipe.totalTime}min</span>
          </div>
          <div className="flex items-center">
            <FaUtensils className="text-gray-500 mr-1" />
            <span className="text-sm text-gray-500">{recipe.servings} servings</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          {recipe.dietaryTags?.map(tag => (
            <span
              key={tag}
              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-1">{renderStars()}</div>
          <span className="text-sm text-gray-500">
            {recipe.ratings?.average?.toFixed(1)} ({recipe.ratings?.count} reviews)
          </span>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Calories:</span>
            <span>{recipe.nutrition.caloriesPerServing} kcal</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Protein:</span>
            <span>{recipe.nutrition.proteinPerServing}g</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Carbs:</span>
            <span>{recipe.nutrition.carbsPerServing}g</span>
          </div>
          <div className="flex justify-between">
            <span>Fat:</span>
            <span>{recipe.nutrition.fatPerServing}g</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recipe;
