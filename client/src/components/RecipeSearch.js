import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import './RecipeSearch.css';

const RecipeSearch = () => {
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [sortBy, setSortBy] = useState('popularity');
    const [tags, setTags] = useState('');

    // Load favorites on component mount
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const response = await axios.get('/api/recipes/user/favorites');
            setFavorites(response.data.map(recipe => recipe.originalId || recipe._id));
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const searchRecipes = async () => {
        if (!searchTerm.trim()) return;
        
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.get('/api/recipes/search', {
                params: {
                    keyword: searchTerm,
                    sort: sortBy,
                    tags: tags,
                    number: 12
                }
            });
            setRecipes(response.data);
        } catch (error) {
            setError('Failed to search recipes. Please try again.');
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRecipeDetails = async (recipeId) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/recipes/${recipeId}/information`);
            setSelectedRecipe(response.data);
        } catch (error) {
            setError('Failed to load recipe details.');
            console.error('Recipe details error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (recipeId) => {
        try {
            const response = await axios.post(`/api/recipes/${recipeId}/favorite`);
            
            if (response.data.isFavorite) {
                setFavorites([...favorites, recipeId]);
            } else {
                setFavorites(favorites.filter(id => id !== recipeId));
            }
        } catch (error) {
            setError('Failed to update favorite status.');
            console.error('Favorite toggle error:', error);
        }
    };

    const saveRecipe = async (recipe) => {
        try {
            const recipeData = {
                name: recipe.title,
                cuisine: recipe.cuisines?.[0] || 'Various',
                ingredients: recipe.extendedIngredients?.map(ing => ({
                    name: ing.name,
                    amount: ing.amount,
                    unit: ing.unit
                })) || [],
                instructions: recipe.analyzedInstructions?.[0]?.steps?.map(step => ({
                    stepNumber: step.number,
                    description: step.step,
                    timerDuration: step.length?.number
                })) || [],
                category: recipe.dishTypes?.[0] || 'Main Course',
                preparationTime: recipe.readyInMinutes,
                complexity: recipe.preparationMinutes > 45 ? 'Hard' : 
                           recipe.preparationMinutes > 25 ? 'Medium' : 'Easy',
                nutritionalInfo: {
                    servingSize: recipe.servings,
                    calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
                    proteins: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
                    carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0,
                    fats: recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0
                },
                image: recipe.image,
                healthScore: recipe.healthScore
            };

            await axios.post('/api/recipes/save', { recipe: recipeData });
            alert('Recipe saved successfully!');
        } catch (error) {
            setError('Failed to save recipe.');
            console.error('Save recipe error:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            searchRecipes();
        }
    };

    return (
        <div className="recipe-search">
            <div className="recipe-search-header">
                <h1>Recipe Search</h1>
                <p>Discover delicious and healthy recipes tailored to your preferences</p>
            </div>

            <div className="search-controls">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for recipes (e.g., chicken, pasta, vegetarian)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="search-input"
                    />
                    <button 
                        onClick={searchRecipes} 
                        disabled={loading || !searchTerm.trim()}
                        className="search-button"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                <div className="filter-controls">
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="popularity">Most Popular</option>
                        <option value="healthiness">Healthiest</option>
                        <option value="time">Quick & Easy</option>
                        <option value="random">Random</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Tags (e.g., vegetarian, gluten-free)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="tags-input"
                    />
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

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

                                <div className="recipe-actions">
                                    <button
                                        onClick={() => toggleFavorite(selectedRecipe.id)}
                                        className={`favorite-btn ${favorites.includes(selectedRecipe.id) ? 'favorited' : ''}`}
                                    >
                                        {favorites.includes(selectedRecipe.id) ? '❤️ Favorited' : '🤍 Add to Favorites'}
                                    </button>
                                    
                                    <button
                                        onClick={() => saveRecipe(selectedRecipe)}
                                        className="save-btn"
                                    >
                                        💾 Save Recipe
                                    </button>
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

            <div className="recipes-grid">
                {recipes.map((recipe) => (
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
                                onClick={() => toggleFavorite(recipe.id)}
                                className={`favorite-icon ${favorites.includes(recipe.id) ? 'favorited' : ''}`}
                            >
                                {favorites.includes(recipe.id) ? '❤️' : '🤍'}
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

            {recipes.length === 0 && !loading && searchTerm && (
                <div className="no-results">
                    <p>No recipes found for "{searchTerm}". Try different keywords or tags.</p>
                </div>
            )}
        </div>
    );
};

export default RecipeSearch;

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
