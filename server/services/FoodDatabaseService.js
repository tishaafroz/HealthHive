const axios = require('axios');

class FoodDatabaseService {
    constructor() {
        this.APP_ID = process.env.EDAMAM_APP_ID;
        this.APP_KEY = process.env.EDAMAM_APP_KEY;
        this.BASE_URL = 'https://api.edamam.com/api/food-database/v2';
    }

    async searchFood(query, pageSize = 20) {
        try {
            const response = await axios.get(`${this.BASE_URL}/parser`, {
                params: {
                    app_id: this.APP_ID,
                    app_key: this.APP_KEY,
                    ingr: query,
                    'nutrition-type': 'logging'
                }
            });

            // Transform the response to match our application's needs
            return response.data.hints.map(item => ({
                foodId: item.food.foodId,
                label: item.food.label,
                category: item.food.category,
                image: item.food.image,
                nutrients: {
                    calories: item.food.nutrients.ENERC_KCAL,
                    protein: item.food.nutrients.PROCNT,
                    fat: item.food.nutrients.FAT,
                    carbohydrates: item.food.nutrients.CHOCDF,
                    fiber: item.food.nutrients.FIBTG
                },
                servingSizes: item.measures.map(measure => ({
                    uri: measure.uri,
                    label: measure.label,
                    weight: measure.weight
                }))
            }));
        } catch (error) {
            console.error('Error searching food:', error);
            throw new Error('Failed to search food database');
        }
    }

    async getNutrients(foodId, measure) {
        try {
            const response = await axios.post(`${this.BASE_URL}/nutrients`, {
                ingredients: [{
                    foodId: foodId,
                    measureURI: measure.uri,
                    quantity: 1
                }]
            }, {
                params: {
                    app_id: this.APP_ID,
                    app_key: this.APP_KEY
                }
            });

            return {
                calories: response.data.calories,
                totalNutrients: response.data.totalNutrients,
                totalDaily: response.data.totalDaily
            };
        } catch (error) {
            console.error('Error getting nutrients:', error);
            throw new Error('Failed to get nutrient information');
        }
    }

    async searchRecipes(query, diet = [], health = [], cuisine = []) {
        try {
            const response = await axios.get(`${this.BASE_URL}/recipes/v2`, {
                params: {
                    app_id: this.APP_ID,
                    app_key: this.APP_KEY,
                    q: query,
                    type: 'public',
                    diet: diet.join(','),
                    health: health.join(','),
                    cuisineType: cuisine.join(',')
                }
            });

            return response.data.hits.map(hit => ({
                recipeId: hit.recipe.uri.split('#')[1],
                label: hit.recipe.label,
                image: hit.recipe.image,
                source: hit.recipe.source,
                url: hit.recipe.url,
                yield: hit.recipe.yield,
                calories: hit.recipe.calories,
                totalTime: hit.recipe.totalTime,
                ingredients: hit.recipe.ingredients,
                nutrients: {
                    protein: hit.recipe.totalNutrients.PROCNT,
                    fat: hit.recipe.totalNutrients.FAT,
                    carbs: hit.recipe.totalNutrients.CHOCDF,
                    fiber: hit.recipe.totalNutrients.FIBTG
                },
                dietLabels: hit.recipe.dietLabels,
                healthLabels: hit.recipe.healthLabels
            }));
        } catch (error) {
            console.error('Error searching recipes:', error);
            throw new Error('Failed to search recipes');
        }
    }
}

module.exports = new FoodDatabaseService();
