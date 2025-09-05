const axios = require('axios');
const mongoose = require('mongoose');

// Test meal plan generation
async function testMealPlanGeneration() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/healthhive');
    console.log('Connected to MongoDB');

    // Import models
    const User = require('./server/models/User');
    const NutritionTargets = require('./server/models/NutritionTargets');
    const MealPlan = require('./server/models/MealPlan');

    // Create or find a test user
    let testUser = await User.findOne({ email: 'test@healthhive.com' });
    
    if (!testUser) {
      testUser = await User.create({
        username: 'testuser',
        email: 'test@healthhive.com',
        password: 'hashedpassword123',
        age: 30,
        gender: 'male',
        height: 175,
        weight: 70,
        activityLevel: 'moderate',
        healthGoal: 'maintenance'
      });
      console.log('Created test user:', testUser._id);
    } else {
      // Update user with complete profile
      testUser.age = 30;
      testUser.gender = 'male';
      testUser.height = 175;
      testUser.weight = 70;
      testUser.activityLevel = 'moderate';
      testUser.healthGoal = 'maintenance';
      await testUser.save();
      console.log('Updated test user:', testUser._id);
    }

    // Test meal plan generation logic directly
    const { generateMealPlan } = require('./server/controllers/mealController');
    
    // Create mock request object
    const mockReq = {
      user: testUser,
      body: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        preferences: {}
      }
    };

    // Create mock response object
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log('Response status:', code);
          console.log('Response data:', JSON.stringify(data, null, 2));
        }
      }),
      json: (data) => {
        console.log('Success response:', JSON.stringify(data, null, 2));
      }
    };

    console.log('Testing meal plan generation...');
    await generateMealPlan(mockReq, mockRes);

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

testMealPlanGeneration();
