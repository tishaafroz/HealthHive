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

/* Duplicate RecipeSearch component removed to fix redeclaration error */
