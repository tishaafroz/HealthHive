const Food = require('../models/Food');

// Search foods with filters
exports.searchFoods = async (req, res) => {
  try {
    const {
      q = '',
      category = '',
      limit = 20,
      page = 1,
      sortBy = 'name',
      sortOrder = 'asc',
      minCalories = 0,
      maxCalories = 9999,
      minProtein = 0,
      maxProtein = 999,
      allergens = []
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build search query
    let query = {};
    
    // Text search
    if (q) {
      query.$text = { $search: q };
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Calorie range filter
    query['nutrition.calories'] = { $gte: parseInt(minCalories), $lte: parseInt(maxCalories) };
    
    // Protein range filter
    query['nutrition.protein'] = { $gte: parseInt(minProtein), $lte: parseInt(maxProtein) };
    
    // Allergen filter (exclude foods with specified allergens)
    if (allergens.length > 0) {
      query.allergens = { $nin: allergens.split(',') };
    }

    // Build sort object
    let sort = {};
    if (sortBy === 'calories') {
      sort['nutrition.calories'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'protein') {
      sort['nutrition.protein'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'popularity') {
      sort.searchCount = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query
    const foods = await Food.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Food.countDocuments(query);

    // Update search count for found foods
    if (foods.length > 0) {
      const foodIds = foods.map(food => food._id);
      await Food.updateMany(
        { _id: { $in: foodIds } },
        { $inc: { searchCount: 1 } }
      );
    }

    res.json({
      success: true,
      data: foods,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Food search error:', error);
    res.status(500).json({ message: 'Server error while searching foods' });
  }
};

// Get food by ID
exports.getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const food = await Food.findById(id);
    
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Increment search count
    food.searchCount += 1;
    await food.save();

    res.json({
      success: true,
      data: food
    });

  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({ message: 'Server error while fetching food' });
  }
};

// Get food categories
exports.getFoodCategories = async (req, res) => {
  try {
    const categories = await Food.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgCalories: { $avg: '$nutrition.calories' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

// Add custom food
exports.addCustomFood = async (req, res) => {
  try {
    const userId = req.user.id;
    const foodData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'category', 'nutrition', 'servingSize'];
    for (const field of requiredFields) {
      if (!foodData[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Create custom food
    const customFood = new Food({
      ...foodData,
      isCustom: true,
      addedBy: userId,
      verified: false,
      dataSource: 'User Input'
    });

    await customFood.save();

    res.status(201).json({
      success: true,
      data: customFood,
      message: 'Custom food added successfully'
    });

  } catch (error) {
    console.error('Add custom food error:', error);
    res.status(500).json({ message: 'Server error while adding custom food' });
  }
};

// Update custom food
exports.updateCustomFood = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find custom food and verify ownership
    const food = await Food.findOne({ _id: id, isCustom: true, addedBy: userId });
    
    if (!food) {
      return res.status(404).json({ message: 'Custom food not found or access denied' });
    }

    // Update food
    Object.assign(food, updateData, { updatedAt: new Date() });
    await food.save();

    res.json({
      success: true,
      data: food,
      message: 'Custom food updated successfully'
    });

  } catch (error) {
    console.error('Update custom food error:', error);
    res.status(500).json({ message: 'Server error while updating custom food' });
  }
};

// Delete custom food
exports.deleteCustomFood = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const food = await Food.findOneAndDelete({ _id: id, isCustom: true, addedBy: userId });
    
    if (!food) {
      return res.status(404).json({ message: 'Custom food not found or access denied' });
    }

    res.json({
      success: true,
      message: 'Custom food deleted successfully'
    });

  } catch (error) {
    console.error('Delete custom food error:', error);
    res.status(500).json({ message: 'Server error while deleting custom food' });
  }
};

// Get popular foods
exports.getPopularFoods = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularFoods = await Food.find({ isPopular: true })
      .sort({ searchCount: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: popularFoods
    });

  } catch (error) {
    console.error('Get popular foods error:', error);
    res.status(500).json({ message: 'Server error while fetching popular foods' });
  }
};