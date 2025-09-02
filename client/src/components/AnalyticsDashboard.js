import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import axios from 'axios';
import { FaChartLine, FaWeight, FaFire, FaAppleAlt } from 'react-icons/fa';

const AnalyticsDashboard = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    weightTrend: [],
    calorieBalance: [],
    workoutMetrics: [],
    mealCompliance: [],
    nutritionDistribution: [],
    goalProgress: null
  });

  const calculateNutritionDistribution = (mealData) => {
    return mealData.reduce((acc, day) => {
      const total = day.protein + day.carbs + day.fat;
      return {
        protein: acc.protein + (day.protein / total * 100),
        carbs: acc.carbs + (day.carbs / total * 100),
        fat: acc.fat + (day.fat / total * 100)
      };
    }, { protein: 0, carbs: 0, fat: 0 });
  };

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [
        weightResponse,
        calorieResponse,
        workoutResponse,
        mealResponse,
        goalResponse
      ] = await Promise.all([
        axios.get(`/api/progress/weight-trend?period=${timeframe}`),
        axios.get(`/api/progress/calorie-balance?period=${timeframe}`),
        axios.get(`/api/progress/workout-metrics?period=${timeframe}`),
        axios.get(`/api/progress/meal-compliance?period=${timeframe}`),
        axios.get('/api/progress/goal-progress')
      ]);

      setAnalytics({
        weightTrend: weightResponse.data.data,
        calorieBalance: calorieResponse.data.data,
        workoutMetrics: workoutResponse.data.data,
        mealCompliance: mealResponse.data.data,
        nutritionDistribution: calculateNutritionDistribution(mealResponse.data.data),
        goalProgress: goalResponse.data.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h2>Health Analytics Dashboard</h2>
        <div className="timeframe-selector">
          <button
            className={timeframe === 'week' ? 'active' : ''}
            onClick={() => setTimeframe('week')}
          >
            Week
          </button>
          <button
            className={timeframe === 'month' ? 'active' : ''}
            onClick={() => setTimeframe('month')}
          >
            Month
          </button>
          <button
            className={timeframe === 'year' ? 'active' : ''}
            onClick={() => setTimeframe('year')}
          >
            Year
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <div className="analytics-content">
          {/* Weight Trend Chart */}
          <div className="chart-container">
            <h3><FaWeight /> Weight Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.weightTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Calorie Balance Chart */}
          <div className="chart-container">
            <h3><FaFire /> Calorie Balance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analytics.calorieBalance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="consumed" fill="#82ca9d" name="Calories Consumed" />
                <Line type="monotone" dataKey="target" stroke="#8884d8" name="Target Calories" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Workout Metrics Chart */}
          <div className="chart-container">
            <h3><FaChartLine /> Workout Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.workoutMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="duration" fill="#8884d8" name="Duration (min)" />
                <Bar dataKey="intensity" fill="#82ca9d" name="Intensity" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Meal Compliance Chart */}
          <div className="chart-container">
            <h3><FaAppleAlt /> Nutrition Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analytics.mealCompliance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="protein" stackId="1" fill="#8884d8" name="Protein" />
                <Area type="monotone" dataKey="carbs" stackId="1" fill="#82ca9d" name="Carbs" />
                <Area type="monotone" dataKey="fat" stackId="1" fill="#ffc658" name="Fat" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
