import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { 
  FaSearch, 
  FaHeart, 
  FaRegHeart, 
  FaSpinner, 
  FaHistory, 
  FaCookie, 
  FaUtensils,
  FaStar,
  FaClock,
  FaUsers,
  FaLeaf,
  FaTimes,
  FaFire,
  FaAppleAlt,
  FaEye,
  FaPlus,
  FaTh,
  FaList
} from 'react-icons/fa';
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
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('foods');
  
  // Enhanced UI state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance', 'calories', 'protein', 'name'
  const [quickFilters, setQuickFilters] = useState({
    lowCalorie: false,
    highProtein: false,
    vegetarian: false,
    glutenFree: false
  });

  // Clear messages after timeout
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

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
      {/* Notification Messages */}
      {error && (
        <div className="notification error">
          <FaTimes />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-notification">
            <FaTimes />
          </button>
        </div>
      )}
      
      {success && (
        <div className="notification success">
          <FaStar />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="close-notification">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="food-search-header">
        <h1><FaAppleAlt /> Food Database & Recipe Explorer</h1>
        <p>Discover nutritious foods and delicious recipes to fuel your healthy lifestyle</p>
      </div>

      {/* Enhanced Tab Navigation */}
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
          <FaCookie /> 
          <span>Foods & Nutrition</span>
          <span className="tab-badge">{searchResults.length || 0}</span>
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
          <FaUtensils />
          <span>Recipes</span>
          <span className="tab-badge">{recipeResults.length || 0}</span>
        </button>
      </div>

      {/* Enhanced Search Section */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'foods' ? 
                  "Search foods (e.g., 'chicken breast', 'quinoa', 'salmon')..." : 
                  "Search recipes (e.g., 'pasta', 'smoothie', 'chicken curry')..."
                }
                className="search-input"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button type="submit" className="search-button primary" disabled={loading}>
              {loading ? <FaSpinner className="spinner" /> : <FaSearch />}
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </form>

        {/* Quick Filters */}
        <div className="quick-filters">
          <h4>Quick Filters:</h4>
          <div className="filter-chips">
            <button 
              className={`filter-chip ${quickFilters.lowCalorie ? 'active' : ''}`}
              onClick={() => setQuickFilters(prev => ({ ...prev, lowCalorie: !prev.lowCalorie }))}
            >
              <FaLeaf /> Low Calorie
            </button>
            <button 
              className={`filter-chip ${quickFilters.highProtein ? 'active' : ''}`}
              onClick={() => setQuickFilters(prev => ({ ...prev, highProtein: !prev.highProtein }))}
            >
              <FaFire /> High Protein
            </button>
            <button 
              className={`filter-chip ${quickFilters.vegetarian ? 'active' : ''}`}
              onClick={() => setQuickFilters(prev => ({ ...prev, vegetarian: !prev.vegetarian }))}
            >
              🌱 Vegetarian
            </button>
            <button 
              className={`filter-chip ${quickFilters.glutenFree ? 'active' : ''}`}
              onClick={() => setQuickFilters(prev => ({ ...prev, glutenFree: !prev.glutenFree }))}
            >
              🌾 Gluten-Free
            </button>
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !searchResults.length && !recipeResults.length && !loading && (
          <div className="recent-searches">
            <h4><FaHistory /> Recent Searches</h4>
            <div className="recent-searches-list">
              {recentSearches.map((search, index) => (
                <button 
                  key={index}
                  className="recent-search-item"
                  onClick={() => {
                    setSearchQuery(search);
                    setTimeout(() => {
                      handleSearch({ preventDefault: () => {} });
                    }, 100);
                  }}
                >
                  <FaClock />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Food Search Results */}
      {activeTab === 'foods' && searchResults.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>
              <FaAppleAlt /> 
              Found {searchResults.length} food{searchResults.length !== 1 ? 's' : ''}
            </h3>
            <div className="results-controls">
              <div className="view-toggles">
                <button 
                  className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <FaTh />
                </button>
                <button 
                  className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <FaList />
                </button>
              </div>
              <div className="sort-dropdown">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="calories">Sort by Calories</option>
                  <option value="protein">Sort by Protein</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`search-results ${viewMode}`}>
            {searchResults.map((food) => (
              <div key={food.id} className="food-card" onClick={() => selectFood(food)}>
                <div className="food-card-image">
                  {food.image ? (
                    <img src={food.image} alt={food.name} />
                  ) : (
                    <div className="food-placeholder">
                      <FaAppleAlt />
                    </div>
                  )}
                  <button
                    className={`favorite-button ${favorites.some(f => f.id === food.id) ? 'favorited' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(food);
                    }}
                    title={favorites.some(f => f.id === food.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favorites.some(f => f.id === food.id) ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>
                
                <div className="food-info">
                  <h4>{food.name}</h4>
                  {food.brand && <p className="brand">{food.brand}</p>}
                  
                  <div className="food-nutrients">
                    <div className="nutrient-item calories">
                      <FaFire />
                      <span>{food.nutrients.calories} cal</span>
                    </div>
                    <div className="nutrient-item protein">
                      <span>🥩 {food.nutrients.protein}g protein</span>
                    </div>
                    <div className="nutrient-item carbs">
                      <span>🍞 {food.nutrients.carbs}g carbs</span>
                    </div>
                    <div className="nutrient-item fat">
                      <span>🥑 {food.nutrients.fat}g fat</span>
                    </div>
                  </div>

                  <div className="food-actions">
                    <button 
                      className="view-details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectFood(food);
                      }}
                    >
                      <FaEye /> View Details
                    </button>
                    <button 
                      className="add-to-meal-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to meal functionality can be implemented
                        setSuccess(`${food.name} added to meal plan!`);
                      }}
                    >
                      <FaPlus /> Add to Meal
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Recipe Search Results */}
      {activeTab === 'recipes' && recipeResults.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>
              <FaUtensils /> 
              Found {recipeResults.length} recipe{recipeResults.length !== 1 ? 's' : ''}
            </h3>
            <div className="results-controls">
              <div className="view-toggles">
                <button 
                  className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <FaTh />
                </button>
                <button 
                  className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <FaList />
                </button>
              </div>
              <div className="sort-dropdown">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="time">Sort by Cook Time</option>
                  <option value="health">Sort by Health Score</option>
                  <option value="popularity">Sort by Popularity</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`recipes-grid ${viewMode}`}>
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
                  
                  <div className="recipe-badges">
                    {recipe.vegetarian && <span className="badge vegetarian">🌱 Vegetarian</span>}
                    {recipe.vegan && <span className="badge vegan">🌿 Vegan</span>}
                    {recipe.glutenFree && <span className="badge gluten-free">🌾 Gluten-Free</span>}
                    {recipe.dairyFree && <span className="badge dairy-free">🥛 Dairy-Free</span>}
                  </div>
                  
                  <button
                    onClick={() => toggleRecipeFavorite(recipe.id)}
                    className={`favorite-icon ${recipeFavorites.includes(recipe.id) ? 'favorited' : ''}`}
                    title={recipeFavorites.includes(recipe.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {recipeFavorites.includes(recipe.id) ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>
                
                <div className="recipe-card-content">
                  <h4 className="recipe-title">{recipe.title}</h4>
                  
                  <div className="recipe-stats">
                    <div className="stat-item">
                      <FaClock />
                      <span>{recipe.readyInMinutes} min</span>
                    </div>
                    <div className="stat-item">
                      <FaUsers />
                      <span>{recipe.servings} servings</span>
                    </div>
                    <div className="stat-item health-score">
                      <FaLeaf />
                      <span>{recipe.healthScore}/100</span>
                    </div>
                  </div>

                  {recipe.nutrition && (
                    <div className="recipe-nutrition">
                      <div className="nutrition-item">
                        <FaFire />
                        <span>{Math.round(recipe.nutrition.calories || 0)} cal</span>
                      </div>
                      <div className="nutrition-item">
                        <span>🥩 {Math.round(recipe.nutrition.protein || 0)}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span>🍞 {Math.round(recipe.nutrition.carbs || 0)}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span>🥑 {Math.round(recipe.nutrition.fat || 0)}g</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="recipe-card-actions">
                    <button
                      onClick={() => getRecipeDetails(recipe.id)}
                      className="view-details-btn primary"
                    >
                      <FaEye /> View Recipe
                    </button>
                    <button
                      onClick={() => {
                        // Add to meal plan functionality
                        setSuccess(`${recipe.title} added to meal plan!`);
                      }}
                      className="add-to-meal-btn secondary"
                    >
                      <FaPlus /> Add to Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Loading State */}
      {loading && (
        <div className="loading-section">
          <div className="loading-spinner">
            <FaSpinner />
          </div>
          <h3>Searching {activeTab}...</h3>
          <p>Finding the best {activeTab === 'foods' ? 'nutrition information' : 'recipes'} for you</p>
        </div>
      )}

      {/* Enhanced Empty State */}
      {!loading && searchQuery && (
        <>
          {activeTab === 'foods' && searchResults.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <FaAppleAlt />
              </div>
              <h3>No foods found</h3>
              <p>Try adjusting your search terms or check out some popular foods below</p>
              <div className="suggested-searches">
                <h4>Try searching for:</h4>
                <div className="suggestion-chips">
                  {['chicken breast', 'salmon', 'quinoa', 'avocado', 'spinach', 'almonds'].map(suggestion => (
                    <button 
                      key={suggestion}
                      className="suggestion-chip"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setTimeout(() => {
                          handleSearch({ preventDefault: () => {} });
                        }, 100);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recipes' && recipeResults.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <FaUtensils />
              </div>
              <h3>No recipes found</h3>
              <p>Try different keywords or explore these popular recipe categories</p>
              <div className="suggested-searches">
                <h4>Popular categories:</h4>
                <div className="suggestion-chips">
                  {['pasta', 'chicken curry', 'smoothie bowl', 'salad', 'stir fry', 'soup'].map(suggestion => (
                    <button 
                      key={suggestion}
                      className="suggestion-chip"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setTimeout(() => {
                          handleSearch({ preventDefault: () => {} });
                        }, 100);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Welcome State */}
      {!loading && !searchQuery && searchResults.length === 0 && recipeResults.length === 0 && (
        <div className="welcome-state">
          <div className="welcome-content">
            <div className="welcome-icons">
              <FaAppleAlt className="icon primary" />
              <FaUtensils className="icon secondary" />
              <FaHeart className="icon accent" />
            </div>
            <h2>Discover Healthy Foods & Recipes</h2>
            <p>Search our comprehensive database of nutritious foods and delicious recipes to support your health goals</p>
            
            <div className="feature-grid">
              <div className="feature-item">
                <FaAppleAlt />
                <h4>Nutrition Database</h4>
                <p>Access detailed nutrition info for thousands of foods</p>
              </div>
              <div className="feature-item">
                <FaUtensils />
                <h4>Recipe Collection</h4>
                <p>Discover healthy and delicious recipes for every meal</p>
              </div>
              <div className="feature-item">
                <FaHeart />
                <h4>Save Favorites</h4>
                <p>Keep track of your favorite foods and recipes</p>
              </div>
              <div className="feature-item">
                <FaPlus />
                <h4>Meal Planning</h4>
                <p>Add items directly to your meal plans</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Food Details Modal */}
      {selectedFood && (
        <div className="food-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedFood.name}</h2>
              <button className="close-button" onClick={() => setSelectedFood(null)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="food-details-grid">
                <div className="food-image-section">
                  {selectedFood.image ? (
                    <img src={selectedFood.image} alt={selectedFood.name} />
                  ) : (
                    <div className="food-placeholder-large">
                      <FaAppleAlt />
                    </div>
                  )}
                  {selectedFood.brand && (
                    <div className="brand-info">
                      <span className="brand-label">Brand:</span>
                      <span className="brand-name">{selectedFood.brand}</span>
                    </div>
                  )}
                </div>
                
                <div className="nutrition-section">
                  <h3><FaFire /> Nutrition Facts</h3>
                  <div className="nutrition-table">
                    <div className="nutrition-row main">
                      <span className="nutrient-label">Calories</span>
                      <span className="nutrient-value">{selectedFood.nutrients.calories} kcal</span>
                    </div>
                    <div className="nutrition-row">
                      <span className="nutrient-label">Protein</span>
                      <span className="nutrient-value">{selectedFood.nutrients.protein}g</span>
                    </div>
                    <div className="nutrition-row">
                      <span className="nutrient-label">Carbohydrates</span>
                      <span className="nutrient-value">{selectedFood.nutrients.carbs}g</span>
                    </div>
                    <div className="nutrition-row">
                      <span className="nutrient-label">Fat</span>
                      <span className="nutrient-value">{selectedFood.nutrients.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  className={`favorite-button ${favorites.some(f => f.id === selectedFood.id) ? 'favorited' : ''}`}
                  onClick={() => toggleFavorite(selectedFood)}
                >
                  {favorites.some(f => f.id === selectedFood.id) ? <FaHeart /> : <FaRegHeart />}
                  {favorites.some(f => f.id === selectedFood.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                <button
                  className="add-to-meal-button"
                  onClick={() => {
                    setSuccess(`${selectedFood.name} added to meal plan!`);
                    setSelectedFood(null);
                  }}
                >
                  <FaPlus /> Add to Meal Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Recipe Details Modal */}
      {selectedRecipe && (
        <div className="recipe-modal">
          <div className="recipe-modal-content">
            <div className="recipe-modal-header">
              <h2>{selectedRecipe.title}</h2>
              <button 
                className="close-modal"
                onClick={() => setSelectedRecipe(null)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="recipe-details">
              <div className="recipe-image-section">
                <img 
                  src={selectedRecipe.image} 
                  alt={selectedRecipe.title}
                  className="recipe-image"
                />
                
                <div className="recipe-meta-cards">
                  <div className="meta-card">
                    <FaClock />
                    <div>
                      <span className="meta-value">{selectedRecipe.readyInMinutes}</span>
                      <span className="meta-label">minutes</span>
                    </div>
                  </div>
                  <div className="meta-card">
                    <FaUsers />
                    <div>
                      <span className="meta-value">{selectedRecipe.servings}</span>
                      <span className="meta-label">servings</span>
                    </div>
                  </div>
                  <div className="meta-card">
                    <FaLeaf />
                    <div>
                      <span className="meta-value">{selectedRecipe.healthScore}</span>
                      <span className="meta-label">health score</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="recipe-content">
                {selectedRecipe.summary && (
                  <div className="recipe-summary">
                    <h3>Description</h3>
                    <div 
                      className="summary-text"
                      dangerouslySetInnerHTML={{ __html: selectedRecipe.summary }} 
                    />
                  </div>
                )}

                {selectedRecipe.extendedIngredients && (
                  <div className="ingredients-section">
                    <h3><FaAppleAlt /> Ingredients ({selectedRecipe.extendedIngredients.length})</h3>
                    <div className="ingredients-grid">
                      {selectedRecipe.extendedIngredients.map((ingredient, index) => (
                        <div key={index} className="ingredient-item">
                          <span className="ingredient-amount">
                            {ingredient.amount} {ingredient.unit}
                          </span>
                          <span className="ingredient-name">{ingredient.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecipe.analyzedInstructions?.[0]?.steps && (
                  <div className="instructions-section">
                    <h3><FaUtensils /> Instructions</h3>
                    <div className="instructions-list">
                      {selectedRecipe.analyzedInstructions[0].steps.map((step) => (
                        <div key={step.number} className="instruction-step">
                          <div className="step-number">{step.number}</div>
                          <div className="step-content">{step.step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="recipe-actions">
                  <button
                    className={`favorite-button ${recipeFavorites.includes(selectedRecipe.id) ? 'favorited' : ''}`}
                    onClick={() => toggleRecipeFavorite(selectedRecipe.id)}
                  >
                    {recipeFavorites.includes(selectedRecipe.id) ? <FaHeart /> : <FaRegHeart />}
                    {recipeFavorites.includes(selectedRecipe.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                  <button
                    className="add-to-meal-button"
                    onClick={() => {
                      setSuccess(`${selectedRecipe.title} added to meal plan!`);
                      setSelectedRecipe(null);
                    }}
                  >
                    <FaPlus /> Add to Meal Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodSearch;
