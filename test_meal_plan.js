const axios = require('axios');

async function testMealPlan() {
    try {
        // Test meal plan generation
        const response = await axios.post('http://localhost:5000/api/meals/generate', {
            preferences: {
                calorieTarget: 2000,
                dietaryRestrictions: [],
                excludedIngredients: []
            },
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            duration: 7
        });

        console.log('Meal Plan Generated Successfully!');
        console.log('Response structure:', {
            hasData: !!response.data,
            hasDailyPlans: !!response.data.dailyPlans,
            dailyPlansCount: response.data.dailyPlans?.length || 0,
            firstDayStructure: response.data.dailyPlans?.[0] ? Object.keys(response.data.dailyPlans[0]) : null
        });

        if (response.data.dailyPlans && response.data.dailyPlans.length > 0) {
            const firstDay = response.data.dailyPlans[0];
            console.log('First day details:', {
                date: firstDay.date,
                mealsCount: firstDay.meals?.length || 0,
                totalNutrition: firstDay.totalNutrition,
                nutritionProgress: firstDay.nutritionProgress
            });
        }

    } catch (error) {
        console.error('Error testing meal plan:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
    }
}

testMealPlan();
