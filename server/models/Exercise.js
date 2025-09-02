const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['cardio', 'strength', 'flexibility', 'sports'],
    required: true
  },
  muscleGroups: [{
    type: String,
    enum: ['chest', 'back', 'legs', 'arms', 'core', 'full_body']
  }],
  equipment: [{
    type: String,
    enum: ['none', 'dumbbells', 'barbell', 'machine', 'resistance_band']
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  caloriesPerMinute: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  instructions: [{
    type: String
  }],
  imageUrl: String,
  videoUrl: String
}, {
  timestamps: true
});

// Index for search functionality
exerciseSchema.index({ name: 'text', description: 'text' });
exerciseSchema.index({ category: 1, difficulty: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
