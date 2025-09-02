import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaHeart, FaRegHeart, FaSpinner, FaUtensils, FaHistory } from 'react-icons/fa';
import '../styles/FoodSearch.css';

const FoodSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
    loadRecentSearches();
  }, []);

  const loadRecentSearches = () => {
    const searches = JSON.parse(localStorage.getItem('recentFoodSearches') || '[]');
    setRecentSearches(searches);
  };

  const addToRecentSearches = (query) => {
    const searches = JSON.parse(localStorage.getItem('recentFoodSearches') || '[]');
    const updatedSearches = [query, ...searches.filter(s => s !== query)].slice(0, 5);
    localStorage.setItem('recentFoodSearches', JSON.stringify(updatedSearches));
    setRecentSearches(updatedSearches);
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('/api/foods/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/foods/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
      addToRecentSearches(searchQuery);
    } catch (error) {
      setError('Error searching foods. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = async (food) => {
    try {
      const response = await axios.get(`/api/foods/nutrients/${food.foodId}`);
      setSelectedFood({
        ...food,
        detailedNutrients: response.data
      });
    } catch (error) {
      console.error('Error fetching nutrient details:', error);
    }
  };

  const toggleFavorite = async (food) => {
    try {
      if (isFavorite(food)) {
        await axios.delete(`/api/foods/favorites/${food.foodId}`);
      } else {
        await axios.post('/api/foods/favorites', { foodData: food });
      }
      await fetchFavorites();
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const isFavorite = (food) => {
    return favorites.some(fav => fav.foodId === food.foodId);
  };

  return (
    <div className="food-search-container">
      <div className="search-section">
        <h2><FaUtensils /> Food Database Search</h2>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for any food..."
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? <FaSpinner className="spinner" /> : <FaSearch />}
            </button>
          </div>
        </form>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <h3><FaHistory /> Recent Searches</h3>
            <div className="recent-searches-list">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  className="recent-search-item"
                  onClick={() => {
                    setSearchQuery(search);
                    handleSearch({ preventDefault: () => {} });
                  }}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Search Results */}
        <div className="search-results">
          {searchResults.map((food) => (
            <div key={food.foodId} className="food-item">
              <div className="food-info" onClick={() => handleFoodSelect(food)}>
                {food.image && (
                  <img src={food.image} alt={food.label} className="food-image" />
                )}
                <div className="food-details">
                  <h3>{food.label}</h3>
                  <p className="food-category">{food.category}</p>
                  <div className="nutrient-summary">
                    <span>Calories: {Math.round(food.nutrients.calories)} kcal</span>
                    <span>Protein: {Math.round(food.nutrients.protein)}g</span>
                    <span>Carbs: {Math.round(food.nutrients.carbohydrates)}g</span>
                    <span>Fat: {Math.round(food.nutrients.fat)}g</span>
                  </div>
                </div>
              </div>
              <button
                className="favorite-button"
                onClick={() => toggleFavorite(food)}
                title={isFavorite(food) ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite(food) ? (
                  <FaHeart className="favorite-icon active" />
                ) : (
                  <FaRegHeart className="favorite-icon" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Food Details */}
      {selectedFood && (
        <div className="nutrient-details">
          <div className="nutrient-details-header">
            <h3>Detailed Nutrition Information</h3>
            <h4>{selectedFood.label}</h4>
          </div>
          <div className="nutrient-grid">
            {selectedFood.detailedNutrients && Object.entries(selectedFood.detailedNutrients.totalNutrients).map(([key, nutrient]) => (
              <div key={key} className="nutrient-item">
                <span className="nutrient-label">{nutrient.label}</span>
                <span className="nutrient-value">
                  {Math.round(nutrient.quantity * 10) / 10} {nutrient.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorites Section */}
      <div className="favorites-section">
        <h2><FaHeart /> Favorite Foods</h2>
        <div className="favorites-grid">
          {favorites.map((food) => (
            <div key={food.foodId} className="favorite-item" onClick={() => handleFoodSelect(food)}>
              {food.image && (
                <img src={food.image} alt={food.label} className="favorite-image" />
              )}
              <div className="favorite-details">
                <h3>{food.label}</h3>
                <div className="favorite-nutrients">
                  <span>Calories: {Math.round(food.nutrients.calories)} kcal</span>
                  <span>Protein: {Math.round(food.nutrients.protein)}g</span>
                </div>
                <button
                  className="remove-favorite-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(food);
                  }}
                >
                  Remove from favorites
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoodSearch;
