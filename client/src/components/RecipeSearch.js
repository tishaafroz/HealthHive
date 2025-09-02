import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaFilter, FaSlidersH } from 'react-icons/fa';
import Recipe from './Recipe';

const RecipeSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    mealType: '',
    difficulty: '',
    maxPrepTime: '',
    dietaryTags: [],
    healthBenefits: [],
    calorieRange: ''
  });
  
  useEffect(() => {
    fetchRecommendedRecipes();
  }, []);
  
  const fetchRecommendedRecipes = async () => {
    try {
      const response = await axios.get('/api/recipes/recommendations');
      setRecipes(response.data.data);
    } catch (error) {
      console.error('Error fetching recommended recipes:', error);
    }
  };
  
  const searchRecipes = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        query: searchQuery,
        ...filters
      });
      
      const response = await axios.get(`/api/recipes/search?${queryParams}`);
      setRecipes(response.data.data);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    searchRecipes();
  };
  
  return (
    <div className="p-4">
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaSearch />
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <FaSlidersH />
          </button>
        </form>
        
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Type
                </label>
                <select
                  value={filters.mealType}
                  onChange={(e) => handleFilterChange('mealType', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Prep Time (mins)
                </label>
                <input
                  type="number"
                  value={filters.maxPrepTime}
                  onChange={(e) => handleFilterChange('maxPrepTime', e.target.value)}
                  className="w-full p-2 border rounded"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Tags
                </label>
                <select
                  multiple
                  value={filters.dietaryTags}
                  onChange={(e) => handleFilterChange('dietaryTags', 
                    Array.from(e.target.selectedOptions, option => option.value)
                  )}
                  className="w-full p-2 border rounded"
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten Free</option>
                  <option value="dairy-free">Dairy Free</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Health Benefits
                </label>
                <select
                  multiple
                  value={filters.healthBenefits}
                  onChange={(e) => handleFilterChange('healthBenefits',
                    Array.from(e.target.selectedOptions, option => option.value)
                  )}
                  className="w-full p-2 border rounded"
                >
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-building">Muscle Building</option>
                  <option value="heart-healthy">Heart Healthy</option>
                  <option value="immune-boosting">Immune Boosting</option>
                  <option value="energy-boosting">Energy Boosting</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calorie Range
                </label>
                <select
                  value={filters.calorieRange}
                  onChange={(e) => handleFilterChange('calorieRange', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All</option>
                  <option value="0-300">Under 300</option>
                  <option value="300-500">300-500</option>
                  <option value="500-800">500-800</option>
                  <option value="800-1200">800-1200</option>
                  <option value="1200-9999">1200+</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map(recipe => (
            <Recipe
              key={recipe._id}
              recipe={recipe}
              onInteraction={(type, value) => {
                // Handle interactions if needed
                console.log('Recipe interaction:', type, value);
              }}
            />
          ))}
        </div>
      )}
      
      {!loading && recipes.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No recipes found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  );
};

export default RecipeSearch;
