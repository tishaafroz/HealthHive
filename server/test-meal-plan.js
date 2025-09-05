const mongoose = require('mongoose');
require('dotenv').config();

// Test meal plan generation
async function testMealPlanGeneration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthhive');
    console.log('Connected to MongoDB');

    // Import models
    const User = require('./models/User');
    const NutritionTargets = require('./models/NutritionTargets');
    const MealPlan = require('./models/MealPlan');
    const Food = require('./models/Food');

    // Create or find a test user
    let testUser = await User.findOne({ email: 'test@healthhive.com' });
    
    if (!testUser) {
      testUser = await User.create({
        username: 'testuser',
        email: 'test@healthhive.com',
        password: 'hashedpassword123',
        firstName: 'Test',
        lastName: 'User',
        age: 30,
        gender: 'male',
        height: 175,
        weight: 70,
        activityLevel: 'moderate',
        healthGoal: 'maintain_weight'
      });
      console.log('Created test user:', testUser._id);
    } else {
      // Update user with complete profile
      testUser.firstName = 'Test';
      testUser.lastName = 'User';
      testUser.age = 30;
      testUser.gender = 'male';
      testUser.height = 175;
      testUser.weight = 70;
      testUser.activityLevel = 'moderate';
      testUser.healthGoal = 'maintain_weight';
      await testUser.save();
      console.log('Updated test user:', testUser._id);
    }

    // Import controller function
    const mealController = require('./controllers/mealController');
    
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
    let responseData = null;
    let statusCode = 200;

    const mockRes = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
            console.log('Response status:', code);
            console.log('Response data:', JSON.stringify(data, null, 2));
          }
        };
      },
      json: (data) => {
        responseData = data;
        console.log('Success response:', JSON.stringify(data, null, 2));
      }
    };

    console.log('Testing meal plan generation...');
    await mealController.generateMealPlan(mockReq, mockRes);

    // Check if meal plan was created successfully
    if (statusCode === 200 || statusCode === 201) {
      console.log('✓ Meal plan generation succeeded!');
      
      // Count created Food documents
      const foodCount = await Food.countDocuments();
      console.log(`✓ Food documents in database: ${foodCount}`);
      
      // Count created MealPlan documents
      const mealPlanCount = await MealPlan.countDocuments();
      console.log(`✓ MealPlan documents in database: ${mealPlanCount}`);
      
    } else {
      console.log('✗ Meal plan generation failed');
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

testMealPlanGeneration();
