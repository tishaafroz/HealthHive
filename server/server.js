const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/users');
const healthRoutes = require('./routes/health');
const foodRoutes = require('./routes/foods');
const mealRoutes = require('./routes/meals');
const workoutRoutes = require('./routes/workouts');
const progressRoutes = require('./routes/progress');
const notificationRoutes = require('./routes/notifications');
const recipeRoutes = require('./routes/recipes');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recipes', recipeRoutes);

console.log('MONGO_URI:', process.env.MONGO_URI);
// Database connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    // Try SRV connection first
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4  // Force IPv4
    });
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Primary connection failed:', error.message);
    
    try {
      // Fallback to direct connection
      const fallbackUri = process.env.MONGO_URI
        .replace('mongodb+srv://', 'mongodb://')
        .replace('/?', '/healthhive?');
      
      await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4  // Force IPv4
      });
      isConnected = true;
      console.log('MongoDB connected through fallback connection');
    } catch (fallbackError) {
      console.error('All connection attempts failed:', fallbackError.message);
      process.exit(1);  // Exit if we can't connect to the database
    }
  }
};

// Initial connection
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));