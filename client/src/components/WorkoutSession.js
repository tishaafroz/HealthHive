import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkoutSession = ({ sessionId }) => {
  const [session, setSession] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [exerciseTimer, setExerciseTimer] = useState(null);
  const [restTimer, setRestTimer] = useState(null);
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const response = await axios.get(`/api/workouts/sessions/${sessionId}`);
      setSession(response.data);
    } catch (error) {
      console.error('Error loading workout session:', error);
    }
  };

  const startSession = async () => {
    try {
      await axios.post(`/api/workouts/sessions/${sessionId}/start`);
      startExerciseTimer();
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const startExerciseTimer = () => {
    const exercise = session.exercises[currentExercise];
    if (!exercise) return;

    const duration = exercise.plannedDuration || 60; // Default to 60 seconds
    let timeLeft = duration;

    const timer = setInterval(() => {
      timeLeft--;
      setExerciseTimer(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        startRestTimer();
      }
    }, 1000);
  };

  const startRestTimer = () => {
    const exercise = session.exercises[currentExercise];
    if (!exercise) return;

    setIsResting(true);
    let restTime = exercise.restTime || 60; // Default to 60 seconds rest

    const timer = setInterval(() => {
      restTime--;
      setRestTimer(restTime);

      if (restTime <= 0) {
        clearInterval(timer);
        setIsResting(false);
        moveToNextExercise();
      }
    }, 1000);
  };

  const moveToNextExercise = () => {
    if (currentExercise < session.exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      startExerciseTimer();
    } else {
      finishSession();
    }
  };

  const updateExerciseProgress = async (exerciseId, setNumber, reps, weight) => {
    try {
      await axios.put(`/api/workouts/sessions/${sessionId}/progress`, {
        exerciseId,
        setNumber,
        reps,
        weight
      });
      loadSession();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const finishSession = async () => {
    try {
      await axios.post(`/api/workouts/sessions/${sessionId}/complete`, {
        rating: 5, // Could be user input
        notes: 'Great workout!' // Could be user input
      });
      // Redirect to summary or dashboard
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  if (!session) {
    return <div>Loading session...</div>;
  }

  const currentEx = session.exercises[currentExercise];

  return (
    <div className="workout-session">
      <div className="workout-session__header">
        <h2>Current Workout</h2>
        {!session.startTime && (
          <button onClick={startSession}>Start Workout</button>
        )}
      </div>

      {session.startTime && (
        <div className="workout-session__content">
          <div className="exercise-card">
            <h3>{currentEx.exerciseId.name}</h3>
            <div className="exercise-details">
              <p>Sets: {currentEx.completedSets}/{currentEx.plannedSets}</p>
              <p>Reps: {currentEx.plannedReps}</p>
              {currentEx.plannedWeight && (
                <p>Weight: {currentEx.plannedWeight}kg</p>
              )}
            </div>

            <div className="timer-display">
              {isResting ? (
                <>
                  <h4>Rest Time</h4>
                  <div className="timer">{restTimer}s</div>
                </>
              ) : (
                <>
                  <h4>Exercise Time</h4>
                  <div className="timer">{exerciseTimer}s</div>
                </>
              )}
            </div>

            <div className="set-tracking">
              {Array.from({ length: currentEx.plannedSets }).map((_, setIndex) => (
                <div key={setIndex} className="set-input">
                  <span>Set {setIndex + 1}:</span>
                  <input
                    type="number"
                    placeholder="Reps"
                    value={currentEx.actualReps[setIndex] || ''}
                    onChange={(e) => updateExerciseProgress(
                      currentEx.exerciseId._id,
                      setIndex,
                      parseInt(e.target.value),
                      currentEx.actualWeight[setIndex]
                    )}
                  />
                  {currentEx.plannedWeight && (
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={currentEx.actualWeight[setIndex] || ''}
                      onChange={(e) => updateExerciseProgress(
                        currentEx.exerciseId._id,
                        setIndex,
                        currentEx.actualReps[setIndex],
                        parseInt(e.target.value)
                      )}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="navigation-buttons">
              {currentExercise > 0 && (
                <button onClick={() => setCurrentExercise(prev => prev - 1)}>
                  Previous Exercise
                </button>
              )}
              {currentExercise < session.exercises.length - 1 && (
                <button onClick={moveToNextExercise}>
                  Next Exercise
                </button>
              )}
              {currentExercise === session.exercises.length - 1 && (
                <button onClick={finishSession}>
                  Complete Workout
                </button>
              )}
            </div>
          </div>

          <div className="workout-summary">
            <h3>Workout Progress</h3>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${(currentExercise / session.exercises.length) * 100}%` }}
              />
            </div>
            <p>
              Exercise {currentExercise + 1} of {session.exercises.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutSession;
