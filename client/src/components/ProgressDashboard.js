import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { format } from 'date-fns';

const ProgressDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [weightTrend, setWeightTrend] = useState([]);
  const [activitySummary, setActivitySummary] = useState(null);
  const [goalProgress, setGoalProgress] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, weightRes, activityRes, goalRes] = await Promise.all([
        axios.get('/api/progress/analytics/dashboard', {
          params: { period: selectedPeriod }
        }),
        axios.get('/api/progress/analytics/weight-trend', {
          params: { period: selectedPeriod }
        }),
        axios.get('/api/progress/analytics/activity-summary'),
        axios.get('/api/progress/analytics/goal-progress')
      ]);

      setAnalytics(analyticsRes.data);
      setWeightTrend(weightRes.data);
      setActivitySummary(activityRes.data);
      setGoalProgress(goalRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  if (!analytics) {
    return <div>Loading dashboard...</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="progress-dashboard">
      <div className="dashboard-header">
        <h2>Progress Dashboard</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="metrics-summary">
        <div className="metric-card">
          <h3>Weight Change</h3>
          <p className={analytics.metrics.weightChange < 0 ? 'decrease' : 'increase'}>
            {Math.abs(analytics.metrics.weightChange).toFixed(1)} kg
            {analytics.metrics.weightChange < 0 ? ' Lost' : ' Gained'}
          </p>
        </div>

        <div className="metric-card">
          <h3>Calories</h3>
          <p>Burned: {analytics.metrics.caloriesBurned}</p>
          <p>Consumed: {analytics.metrics.caloriesConsumed}</p>
        </div>

        <div className="metric-card">
          <h3>Workouts</h3>
          <p>{analytics.metrics.workoutsCompleted} Completed</p>
        </div>

        <div className="metric-card">
          <h3>Meals</h3>
          <p>{analytics.metrics.mealsCompleted} Tracked</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Weight Trend</h3>
          <LineChart width={600} height={300} data={weightTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              name="Weight (kg)"
            />
          </LineChart>
        </div>

        <div className="chart-container">
          <h3>Activity Distribution</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={[
                { name: 'Cardio', value: activitySummary?.workoutMetrics.cardioMinutes || 0 },
                { name: 'Strength', value: activitySummary?.workoutMetrics.strengthMinutes || 0 },
                { name: 'Flexibility', value: activitySummary?.workoutMetrics.flexibilityMinutes || 0 }
              ]}
              cx={200}
              cy={150}
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {activitySummary?.workoutMetrics && Object.values(activitySummary.workoutMetrics).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="chart-container">
          <h3>Goal Progress</h3>
          <BarChart
            width={600}
            height={300}
            data={[
              {
                name: 'Weight Goal',
                progress: goalProgress?.currentProgress.weightProgress || 0,
                target: 100
              },
              {
                name: 'Activity Goal',
                progress: goalProgress?.currentProgress.activityProgress || 0,
                target: 100
              },
              {
                name: 'Nutrition Goal',
                progress: goalProgress?.currentProgress.nutritionProgress || 0,
                target: 100
              }
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="progress" fill="#82ca9d" name="Progress (%)" />
            <Bar dataKey="target" fill="#8884d8" name="Target (%)" />
          </BarChart>
        </div>
      </div>

      {analytics.achievements.length > 0 && (
        <div className="achievements-section">
          <h3>Recent Achievements</h3>
          <div className="achievements-grid">
            {analytics.achievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <img src={achievement.iconUrl} alt={achievement.title} />
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                <small>
                  Unlocked on {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="insights-section">
        <h3>Insights & Recommendations</h3>
        <div className="insights-grid">
          {analytics.trends.weightTrend && (
            <div className="insight-card">
              <h4>Weight Trend</h4>
              <p>
                Your weight is {analytics.trends.weightTrend.toLowerCase()}.
                {analytics.trends.weightTrend === 'decreasing' && ' Keep up the good work!'}
                {analytics.trends.weightTrend === 'increasing' && ' Consider reviewing your nutrition plan.'}
                {analytics.trends.weightTrend === 'stable' && ' Maintain your current routine.'}
              </p>
            </div>
          )}

          {analytics.trends.activityTrend && (
            <div className="insight-card">
              <h4>Activity Level</h4>
              <p>
                Your activity level is {analytics.trends.activityTrend.toLowerCase()}.
                {analytics.trends.activityTrend === 'increasing' && ' Great progress!'}
                {analytics.trends.activityTrend === 'decreasing' && ' Try to increase your activity.'}
                {analytics.trends.activityTrend === 'stable' && ' Consider new challenges.'}
              </p>
            </div>
          )}

          {analytics.trends.complianceTrend && (
            <div className="insight-card">
              <h4>Plan Adherence</h4>
              <p>
                Your plan adherence is {analytics.trends.complianceTrend.toLowerCase()}.
                {analytics.trends.complianceTrend === 'increasing' && ' Excellent discipline!'}
                {analytics.trends.complianceTrend === 'decreasing' && ' Let\'s work on consistency.'}
                {analytics.trends.complianceTrend === 'stable' && ' Good consistency.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
