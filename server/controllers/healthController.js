const BMIHistory = require('../models/BMIHistory');
const User = require('../models/User');

// Calculate BMI using WHO standard formula
const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

// Determine BMI category and health status
const getBMICategory = (bmi) => {
  if (bmi < 18.5) {
    return {
      category: 'underweight',
      status: 'fair',
      recommendations: [
        'Consider increasing caloric intake with nutrient-dense foods',
        'Focus on healthy weight gain through balanced nutrition',
        'Include strength training exercises in your routine',
        'Consult with a healthcare provider for personalized advice'
      ]
    };
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    return {
      category: 'normal',
      status: 'excellent',
      recommendations: [
        'Maintain your current healthy lifestyle',
        'Continue with balanced nutrition and regular exercise',
        'Focus on maintaining muscle mass and overall fitness',
        'Regular health check-ups are recommended'
      ]
    };
  } else if (bmi >= 25 && bmi <= 29.9) {
    return {
      category: 'overweight',
      status: 'good',
      recommendations: [
        'Focus on creating a moderate caloric deficit',
        'Increase physical activity gradually',
        'Choose whole foods and limit processed foods',
        'Consider working with a nutritionist for meal planning'
      ]
    };
  } else {
    return {
      category: 'obese',
      status: 'poor',
      recommendations: [
        'Consult with healthcare professionals for a comprehensive plan',
        'Start with low-impact exercises like walking or swimming',
        'Focus on sustainable lifestyle changes',
        'Consider behavioral therapy for long-term success'
      ]
    };
  }
};

// Calculate and store BMI
exports.calculateBMI = async (req, res) => {
  try {
    const { height, weight } = req.body;
    const userId = req.user.id;

    // Validation
    if (!height || !weight) {
      return res.status(400).json({ message: 'Height and weight are required' });
    }

    if (height < 50 || height > 300) {
      return res.status(400).json({ message: 'Height must be between 50-300 cm' });
    }

    if (weight < 20 || weight > 500) {
      return res.status(400).json({ message: 'Weight must be between 20-500 kg' });
    }

    // Calculate BMI
    const bmi = parseFloat(calculateBMI(weight, height));
    const { category, status, recommendations } = getBMICategory(bmi);

    // Create BMI record
    const bmiRecord = new BMIHistory({
      userId,
      height,
      weight,
      bmi,
      bmiCategory: category,
      healthStatus: status,
      recommendations
    });

    await bmiRecord.save();

    // Update user's current height and weight
    await User.findByIdAndUpdate(userId, {
      height,
      weight,
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: {
        bmi,
        category,
        status,
        recommendations,
        record: bmiRecord
      }
    });

  } catch (error) {
    console.error('BMI calculation error:', error);
    res.status(500).json({ message: 'Server error during BMI calculation' });
  }
};

// Get BMI history
exports.getBMIHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 30, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const bmiHistory = await BMIHistory.find({ userId })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await BMIHistory.countDocuments({ userId });

    res.json({
      success: true,
      data: bmiHistory,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get BMI history error:', error);
    res.status(500).json({ message: 'Server error while fetching BMI history' });
  }
};

// Get health recommendations
exports.getHealthRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get latest BMI record
    const latestBMI = await BMIHistory.findOne({ userId })
      .sort({ date: -1 });

    if (!latestBMI) {
      return res.status(404).json({ message: 'No BMI records found. Please calculate your BMI first.' });
    }

    // Get user profile for personalized recommendations
    const user = await User.findById(userId);
    
    let additionalRecommendations = [];

    // Add goal-specific recommendations
    if (user.healthGoal === 'lose_weight') {
      additionalRecommendations.push(
        'Create a moderate caloric deficit of 300-500 calories per day',
        'Focus on high-protein foods to preserve muscle mass',
        'Include both cardio and strength training exercises'
      );
    } else if (user.healthGoal === 'gain_weight') {
      additionalRecommendations.push(
        'Increase caloric intake by 300-500 calories per day',
        'Prioritize protein-rich foods for muscle building',
        'Include resistance training in your exercise routine'
      );
    }

    // Add activity level recommendations
    if (user.activityLevel === 'sedentary') {
      additionalRecommendations.push(
        'Start with 10-15 minutes of daily walking',
        'Gradually increase physical activity',
        'Consider desk exercises and stretching'
      );
    }

    const allRecommendations = [
      ...latestBMI.recommendations,
      ...additionalRecommendations
    ];

    res.json({
      success: true,
      data: {
        currentBMI: latestBMI.bmi,
        category: latestBMI.bmiCategory,
        status: latestBMI.healthStatus,
        recommendations: allRecommendations,
        lastUpdated: latestBMI.date
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error while fetching recommendations' });
  }
};

// Update BMI record
exports.updateBMI = async (req, res) => {
  try {
    const { id } = req.params;
    const { height, weight } = req.body;
    const userId = req.user.id;

    // Find and verify ownership
    const bmiRecord = await BMIHistory.findOne({ _id: id, userId });
    if (!bmiRecord) {
      return res.status(404).json({ message: 'BMI record not found' });
    }

    // Validation
    if (height < 50 || height > 300) {
      return res.status(400).json({ message: 'Height must be between 50-300 cm' });
    }

    if (weight < 20 || weight > 500) {
      return res.status(400).json({ message: 'Weight must be between 20-500 kg' });
    }

    // Recalculate BMI
    const bmi = parseFloat(calculateBMI(weight, height));
    const { category, status, recommendations } = getBMICategory(bmi);

    // Update record
    bmiRecord.height = height;
    bmiRecord.weight = weight;
    bmiRecord.bmi = bmi;
    bmiRecord.bmiCategory = category;
    bmiRecord.healthStatus = status;
    bmiRecord.recommendations = recommendations;
    bmiRecord.date = new Date();

    await bmiRecord.save();

    res.json({
      success: true,
      data: bmiRecord
    });

  } catch (error) {
    console.error('Update BMI error:', error);
    res.status(500).json({ message: 'Server error while updating BMI' });
  }
};

// Delete BMI record
exports.deleteBMI = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const bmiRecord = await BMIHistory.findOneAndDelete({ _id: id, userId });
    
    if (!bmiRecord) {
      return res.status(404).json({ message: 'BMI record not found' });
    }

    res.json({
      success: true,
      message: 'BMI record deleted successfully'
    });

  } catch (error) {
    console.error('Delete BMI error:', error);
    res.status(500).json({ message: 'Server error while deleting BMI record' });
  }
}; 