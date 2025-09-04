import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { FaSearch, FaHeart, FaRegHeart, FaSpinner, FaHistory, FaCookie, FaUtensils } from 'react-icons/fa';
import '../styles/FoodSearch.css';

const FoodSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recipeResults, setRecipeResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recipeFavorites, setRecipeFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('foods'); // 'foods' or 'recipes'

  useEffect(() => {
    fetchFavorites();
    fetchRecipeFavorites();
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
      const response = await api.get('/api/foods/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Failed to load favorites');
    }
  };

  const fetchRecipeFavorites = async () => {
    try {
      const response = await api.get('/api/recipes/user/favorites');
      setRecipeFavorites(response.data.map(recipe => recipe.originalId || recipe._id));
    } catch (error) {
      console.error('Error fetching recipe favorites:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      if (activeTab === 'foods') {
        const response = await api.get('/api/foods/search', {
          params: { query: searchQuery }
        });
        
        if (response.data && response.data.hints) {
          const formattedResults = response.data.hints.map(item => ({
            id: item.food.foodId,
            name: item.food.label,
            brand: item.food.brand || 'Spoonacular Recipe',
            category: item.food.category,
            nutrients: {
              calories: Math.round(item.food.nutrients.ENERC_KCAL || 0),
              protein: Math.round(item.food.nutrients.PROCNT || 0),
              fat: Math.round(item.food.nutrients.FAT || 0),
              carbs: Math.round(item.food.nutrients.CHOCDF || 0)
            },
            image: item.food.image,
            servings: item.food.servings || 1,
            readyInMinutes: item.food.readyInMinutes || 30
          }));
          setSearchResults(formattedResults);
        } else {
          setSearchResults([]);
        }
      } else {
        // Recipe search
        const response = await api.get('/api/recipes/search', {
          params: {
            keyword: searchQuery,
            sort: 'popularity',
            number: 12
          }
        });
        setRecipeResults(response.data);
      }
      
      addToRecentSearches(searchQuery);
    } catch (error) {
      console.error('Error searching:', error);
      setError(`Failed to search ${activeTab}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (food) => {
    try {
      if (favorites.some(f => f.id === food.id)) {
        await api.delete(`/api/foods/favorites/${food.id}`);
        setFavorites(favorites.filter(f => f.id !== food.id));
      } else {
        const response = await api.post('/api/foods/favorites', { foodData: food });
        setFavorites([...favorites, response.data]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorites');
    }
  };

  const toggleRecipeFavorite = async (recipeId) => {
    try {
      const response = await api.post(`/api/recipes/${recipeId}/favorite`);
      
      if (response.data.isFavorite) {
        setRecipeFavorites([...recipeFavorites, recipeId]);
      } else {
        setRecipeFavorites(recipeFavorites.filter(id => id !== recipeId));
      }
    } catch (error) {
      console.error('Error toggling recipe favorite:', error);
      setError('Failed to update recipe favorites');
    }
  };

  const getRecipeDetails = async (recipeId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/recipes/${recipeId}/information`);
      setSelectedRecipe(response.data);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      setError('Failed to load recipe details.');
    } finally {
      setLoading(false);
    }
  };

  const selectFood = (food) => {
    setSelectedFood(food);
  };

  return (
    <div className="food-search">
      {/* Tab Navigation */}
      <div className="search-tabs">
        <button 
          className={`tab-button ${activeTab === 'foods' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('foods');
            setSearchResults([]);
            setRecipeResults([]);
            setError(null);
          }}
        >
          <FaCookie /> Foods & Nutrition
        </button>
        <button 
          className={`tab-button ${activeTab === 'recipes' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('recipes');
            setSearchResults([]);
            setRecipeResults([]);
            setError(null);
          }}
        >
          <FaUtensils /> Recipes
        </button>
      </div>

      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'foods' ? "Search for foods..." : "Search for recipes..."}
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? <FaSpinner className="spinner" /> : <FaSearch />}
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        {recentSearches.length > 0 && !searchResults.length && !recipeResults.length && (
          <div className="recent-searches">
            <h3><FaHistory /> Recent Searches</h3>
            <ul>
              {recentSearches.map((search, index) => (
                <li key={index}>
                  <button onClick={() => {
                    setSearchQuery(search);
                    handleSearch({ preventDefault: () => {} });
                  }}>
                    {search}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Food Search Results */}
      {activeTab === 'foods' && (
        <div className="search-results">
          {searchResults.map((food) => (
            <div key={food.id} className="food-card" onClick={() => selectFood(food)}>
              {food.image && <img src={food.image} alt={food.name} />}
              <div className="food-info">
                <h3>{food.name}</h3>
                {food.brand && <p className="brand">{food.brand}</p>}
                <div className="food-nutrients">
                  <p>Calories: {food.nutrients.calories}kcal</p>
                  <p>Protein: {food.nutrients.protein}g</p>
                  <p>Carbs: {food.nutrients.carbs}g</p>
                  <p>Fat: {food.nutrients.fat}g</p>
                </div>
              </div>
              <button
                className="favorite-button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(food);
                }}
              >
                {favorites.some(f => f.id === food.id) ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Search Results */}
      {activeTab === 'recipes' && (
        <div className="recipes-grid">
          {recipeResults.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <div className="recipe-card-image">
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  onError={(e) => {
                    e.target.src = '/placeholder-recipe.jpg';
                  }}
                />
                
                <button
                  onClick={() => toggleRecipeFavorite(recipe.id)}
                  className={`favorite-icon ${recipeFavorites.includes(recipe.id) ? 'favorited' : ''}`}
                >
                  {recipeFavorites.includes(recipe.id) ? '❤️' : '🤍'}
                </button>
              </div>
              
              <div className="recipe-card-content">
                <h3 className="recipe-title">{recipe.title}</h3>
                
                <div className="recipe-stats">
                  <span className="recipe-time">⏱️ {recipe.readyInMinutes} min</span>
                  <span className="recipe-servings">👥 {recipe.servings}</span>
                  <span className="recipe-health">💚 {recipe.healthScore}</span>
                </div>
                
                <div className="recipe-card-actions">
                  <button
                    onClick={() => getRecipeDetails(recipe.id)}
                    className="view-details-btn"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Food Details Modal */}
      {selectedFood && (
        <div className="food-details-modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setSelectedFood(null)}>×</button>
            <h2>{selectedFood.name}</h2>
            {selectedFood.image && <img src={selectedFood.image} alt={selectedFood.name} />}
            {selectedFood.brand && <p className="brand">{selectedFood.brand}</p>}
            <div className="nutrient-details">
              <h3>Nutrition Facts</h3>
              <table>
                <tbody>
                  <tr>
                    <td>Calories:</td>
                    <td>{selectedFood.nutrients.calories}kcal</td>
                  </tr>
                  <tr>
                    <td>Protein:</td>
                    <td>{selectedFood.nutrients.protein}g</td>
                  </tr>
                  <tr>
                    <td>Carbohydrates:</td>
                    <td>{selectedFood.nutrients.carbs}g</td>
                  </tr>
                  <tr>
                    <td>Fat:</td>
                    <td>{selectedFood.nutrients.fat}g</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <div className="recipe-modal">
          <div className="recipe-modal-content">
            <button 
              className="close-modal"
              onClick={() => setSelectedRecipe(null)}
            >
              ×
            </button>
            
            <div className="recipe-details">
              <img 
                src={selectedRecipe.image} 
                alt={selectedRecipe.title}
                className="recipe-image"
              />
              
              <div className="recipe-info">
                <h2>{selectedRecipe.title}</h2>
                
                <div className="recipe-meta">
                  <span>⏱️ {selectedRecipe.readyInMinutes} mins</span>
                  <span>👥 {selectedRecipe.servings} servings</span>
                  <span>💚 Health Score: {selectedRecipe.healthScore}/100</span>
                </div>

                {selectedRecipe.summary && (
                  <div className="recipe-summary">
                    <h3>Description</h3>
                    <div dangerouslySetInnerHTML={{ __html: selectedRecipe.summary }} />
                  </div>
                )}

                {selectedRecipe.extendedIngredients && (
                  <div className="ingredients-section">
                    <h3>Ingredients</h3>
                    <ul className="ingredients-list">
                      {selectedRecipe.extendedIngredients.map((ingredient, index) => (
                        <li key={index}>
                          {ingredient.amount} {ingredient.unit} {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRecipe.analyzedInstructions?.[0]?.steps && (
                  <div className="instructions-section">
                    <h3>Instructions</h3>
                    <ol className="instructions-list">
                      {selectedRecipe.analyzedInstructions[0].steps.map((step) => (
                        <li key={step.number}>
                          {step.step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodSearch;
