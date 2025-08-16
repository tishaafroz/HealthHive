import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaFilter, FaStar, FaInfoCircle } from 'react-icons/fa';
import '../styles/FoodSearch.css';

const FoodSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minCalories: 0,
    maxCalories: 9999,
    minProtein: 0,
    maxProtein: 999,
    allergens: []
  });
  const [selectedFood, setSelectedFood] = useState(null);
  const [showFoodModal, setShowFoodModal] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchPopularFoods();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/foods/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPopularFoods = async () => {
    try {
      const response = await axios.get('/api/foods/popular?limit=8');
      setFoods(response.data.data);
    } catch (error) {
      console.error('Error fetching popular foods:', error);
    }
  };

  const searchFoods = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const params = {
        q: searchQuery,
        limit: 20,
        category: selectedCategory,
        ...filters
      };

      const response = await axios.get('/api/foods/search', { params });
      setFoods(response.data.data);
    } catch (error) {
      console.error('Error searching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchFoods();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const openFoodModal = (food) => {
    setSelectedFood(food);
    setShowFoodModal(true);
  };

  const closeFoodModal = () => {
    setSelectedFood(null);
    setShowFoodModal(false);
  };

  const getCategoryColor = (category) => {
    const colors = {
      fruits: '#4CAF50',
      vegetables: '#8BC34A',
      grains: '#FFC107',
      proteins: '#FF5722',
      dairy: '#2196F3',
      nuts_seeds: '#795548',
      oils_fats: '#9C27B0',
      beverages: '#00BCD4',
      snacks: '#FF9800',
      condiments: '#607D8B'
    };
    return colors[category] || '#757575';
  };

  const formatCategory = (category) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="food-search">
      <div className="search-header">
        <h2><FaSearch /> Food & Nutrition Database</h2>
        <p>Search for foods, view nutrition facts, and discover healthy options</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for foods, brands, or ingredients..."
              className="search-input"
            />
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Searching...' : <FaSearch />}
            </button>
          </div>
        </form>

        <div className="search-controls">
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {formatCategory(category._id)} ({category.count})
                </option>
              ))}
            </select>
          </div>

          <button
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Calories Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minCalories}
                    onChange={(e) => handleFilterChange('minCalories', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxCalories}
                    onChange={(e) => handleFilterChange('maxCalories', e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Protein Range (g)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minProtein}
                    onChange={(e) => handleFilterChange('minProtein', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxProtein}
                    onChange={(e) => handleFilterChange('maxProtein', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={searchFoods} className="apply-filters-btn">
                Apply Filters
              </button>
              <button 
                onClick={() => setFilters({
                  minCalories: 0,
                  maxCalories: 9999,
                  minProtein: 0,
                  maxProtein: 999,
                  allergens: []
                })} 
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="foods-grid">
        {foods.map(food => (
          <div key={food._id} className="food-card" onClick={() => openFoodModal(food)}>
            <div className="food-header">
              <span 
                className="food-category"
                style={{ backgroundColor: getCategoryColor(food.category) }}
              >
                {formatCategory(food.category)}
              </span>
              {food.isPopular && <FaStar className="popular-icon" />}
            </div>
            
            <div className="food-info">
              <h3 className="food-name">{food.name}</h3>
              {food.brand && <p className="food-brand">{food.brand}</p>}
              
              <div className="nutrition-preview">
                <div className="nutrition-item">
                  <span className="nutrition-value">{food.nutrition.calories}</span>
                  <span className="nutrition-label">cal</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-value">{food.nutrition.protein}g</span>
                  <span className="nutrition-label">protein</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-value">{food.nutrition.carbohydrates}g</span>
                  <span className="nutrition-label">carbs</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-value">{food.nutrition.fat}g</span>
                  <span className="nutrition-label">fat</span>
                </div>
              </div>
            </div>

            <div className="food-actions">
              <button className="view-details-btn">
                <FaInfoCircle /> View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {foods.length === 0 && !loading && (
        <div className="no-results">
          <p>No foods found. Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Food Detail Modal */}
      {showFoodModal && selectedFood && (
        <div className="food-modal-overlay" onClick={closeFoodModal}>
          <div className="food-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedFood.name}</h2>
              <button className="close-modal-btn" onClick={closeFoodModal}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="food-basic-info">
                <span 
                  className="modal-category"
                  style={{ backgroundColor: getCategoryColor(selectedFood.category) }}
                >
                  {formatCategory(selectedFood.category)}
                </span>
                {selectedFood.brand && <p className="modal-brand">Brand: {selectedFood.brand}</p>}
                {selectedFood.description && <p className="modal-description">{selectedFood.description}</p>}
              </div>

              <div className="nutrition-details">
                <h3>Nutrition Facts</h3>
                <div className="nutrition-grid">
                  <div className="nutrition-row">
                    <span>Calories</span>
                    <span>{selectedFood.nutrition.calories} cal</span>
                  </div>
                  <div className="nutrition-row">
                    <span>Protein</span>
                    <span>{selectedFood.nutrition.protein}g</span>
                  </div>
                  <div className="nutrition-row">
                    <span>Carbohydrates</span>
                    <span>{selectedFood.nutrition.carbohydrates}g</span>
                  </div>
                  <div className="nutrition-row">
                    <span>Fat</span>
                    <span>{selectedFood.nutrition.fat}g</span>
                  </div>
                  <div className="nutrition-row">
                    <span>Fiber</span>
                    <span>{selectedFood.nutrition.fiber}g</span>
                  </div>
                  <div className="nutrition-row">
                    <span>Sugar</span>
                    <span>{selectedFood.nutrition.sugar}g</span>
                  </div>
                  <div className="nutrition-row">
                    <span>Sodium</span>
                    <span>{selectedFood.nutrition.sodium}mg</span>
                  </div>
                </div>
              </div>

              <div className="serving-info">
                <h3>Serving Information</h3>
                <p>Serving Size: {selectedFood.servingSize.amount} {selectedFood.servingSize.unit}</p>
                <p>Weight: {selectedFood.servingSize.weightInGrams}g</p>
              </div>

              {selectedFood.allergens.length > 0 && (
                <div className="allergen-info">
                  <h3>Allergens</h3>
                  <div className="allergen-tags">
                    {selectedFood.allergens.map(allergen => (
                      <span key={allergen} className="allergen-tag">
                        {allergen.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodSearch; 