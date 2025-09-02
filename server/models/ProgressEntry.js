const mongoose = require('mongoose');

const progressEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  bodyFat: Number,
  muscleMass: Number,
  measurements: {
    waist: Number,
    chest: Number,
    arms: Number,
    thighs: Number,
    hips: Number
  },
  photos: [{
    type: {
      type: String,
      enum: ['front', 'side', 'back']
    },
    imageUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String,
  mood: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor']
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Indexes for querying
progressEntrySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('ProgressEntry', progressEntrySchema);
