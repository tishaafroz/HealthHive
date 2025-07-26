const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Basic Info
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Profile Info
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  
  // Personal Details
  age: { type: Number, min: 13, max: 120 },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  height: { type: Number, min: 50, max: 300 }, // cm
  weight: { type: Number, min: 20, max: 500 }, // kg
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
  targetWeight: { type: Number, min: 20, max: 500 },
  goalTimeline: { type: Date },
  
  // Preferences
  dietaryPreferences: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'none']
  }],

  // Profile Completion
  profileCompleted: { type: Boolean, default: false },
  profileCompletionPercentage: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);