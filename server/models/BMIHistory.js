const mongoose = require('mongoose');

const BMIHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  height: {
    type: Number,
    required: true,
    min: 50,
    max: 300
  },
  weight: {
    type: Number,
    required: true,
    min: 20,
    max: 500
  },
  bmi: {
    type: Number,
    required: true,
    min: 10,
    max: 100
  },
  bmiCategory: {
    type: String,
    required: true,
    enum: ['underweight', 'normal', 'overweight', 'obese']
  },
  healthStatus: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'fair', 'poor']
  },
  recommendations: [{
    type: String
  }],
  date: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
BMIHistorySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('BMIHistory', BMIHistorySchema); 