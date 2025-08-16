const User = require('../models/User');

// Helper: Calculate profile completion percentage
function calculateProfileCompletion(user) {
  const requiredFields = [
    'age', 'gender', 'height', 'weight', 'activityLevel',
    'healthGoal', 'dietaryPreferences'
  ];
  let filled = 0;
  requiredFields.forEach(field => {
    if (Array.isArray(user[field])) {
      if (user[field].length > 0) filled++;
    } else if (user[field] !== undefined && user[field] !== null && user[field] !== '') {
      filled++;
    }
  });

  // Target weight is required for lose/gain weight
  if (user.healthGoal === 'lose_weight' || user.healthGoal === 'gain_weight') {
    if (user.targetWeight) filled++;
  } else {
    filled++;
  }

  const total = requiredFields.length + 1; // +1 for targetWeight/goal logic
  const percentage = Math.round((filled / total) * 100);
  return percentage;
}

// Helper: Validate profile data
function validateProfileData(data, currentWeight) {
  const errors = {};

  // Age
  if (typeof data.age !== 'number' || data.age < 13 || data.age > 120) {
    errors.age = 'Age must be between 13 and 120.';
  }
  // Height
  if (typeof data.height !== 'number' || data.height < 50 || data.height > 300) {
    errors.height = 'Height must be between 50 and 300 cm.';
  }
  // Weight
  if (typeof data.weight !== 'number' || data.weight < 20 || data.weight > 500) {
    errors.weight = 'Weight must be between 20 and 500 kg.';
  }
  // Gender
  if (!['male', 'female', 'other'].includes(data.gender)) {
    errors.gender = 'Gender is required.';
  }
  // Activity Level
  if (!['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(data.activityLevel)) {
    errors.activityLevel = 'Invalid activity level.';
  }
  // Health Goal
  if (!['lose_weight', 'gain_weight', 'maintain_weight'].includes(data.healthGoal)) {
    errors.healthGoal = 'Invalid health goal.';
  }
  // Target Weight
  if (['lose_weight', 'gain_weight'].includes(data.healthGoal)) {
    if (typeof data.targetWeight !== 'number' || data.targetWeight < 20 || data.targetWeight > 500) {
      errors.targetWeight = 'Target weight must be between 20 and 500 kg.';
    } else if (data.healthGoal === 'lose_weight' && data.targetWeight >= data.weight) {
      errors.targetWeight = 'Target weight must be less than current weight for weight loss.';
    } else if (data.healthGoal === 'gain_weight' && data.targetWeight <= data.weight) {
      errors.targetWeight = 'Target weight must be greater than current weight for weight gain.';
    }
  }
  // Dietary Preferences
  if (!Array.isArray(data.dietaryPreferences)) {
    errors.dietaryPreferences = 'Dietary preferences must be an array.';
  }

  return errors;
}

// PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes auth middleware sets req.user
    const profileData = req.body;

    // Fetch current user for weight comparison
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Validate input
    const errors = validateProfileData(profileData, user.weight);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Update fields
    Object.assign(user, profileData);

    // Calculate completion
    const completion = calculateProfileCompletion(user);
    user.profileCompletionPercentage = completion;
    user.profileCompleted = completion === 100;

    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      profile: user,
      completion: {
        percentage: completion,
        isComplete: user.profileCompleted
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/users/profile/status
exports.getUserProfileStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('profileCompletionPercentage profileCompleted');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({
      completion: user.profileCompletionPercentage,
      isComplete: user.profileCompleted
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Mark profile as complete/incomplete
exports.updateProfileCompletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileCompleted, profileCompletionPercentage } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        profileCompleted: profileCompleted || false,
        profileCompletionPercentage: profileCompletionPercentage || 0,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
      message: 'Profile completion status updated successfully'
    });

  } catch (error) {
    console.error('Update profile completion error:', error);
    res.status(500).json({ message: 'Server error while updating profile completion' });
  }
};