const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Basic Info
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Profile Info
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  activityLevel: { 
    type: String, 
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    default: 'moderate'
  },
  
  // Goals
  healthGoal: { 
    type: String, 
    enum: ['lose_weight', 'gain_weight', 'maintain_weight'],
    default: 'maintain_weight'
  },
  targetWeight: { type: Number },
  
  // Preferences
  dietaryPreferences: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'none']
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);