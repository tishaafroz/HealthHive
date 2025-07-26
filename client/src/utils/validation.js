export const validationRules = {
  age: { required: true, min: 13, max: 120 },
  height: { required: true, min: 50, max: 300 },
  weight: { required: true, min: 20, max: 500 },
  targetWeight: {
    required: (goal) => goal !== 'maintain_weight',
    min: 20,
    max: 500,
    logical: (current, target, goal) => {
      if (goal === 'lose_weight') return target < current;
      if (goal === 'gain_weight') return target > current;
      return true;
    }
  },
  activityLevel: { required: true },
  healthGoal: { required: true }
}; 