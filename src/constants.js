// formType: 'duration' | 'strength' | 'balance'
export const CATEGORIES = {
  cardio:   { key: 'cardio',   label: 'Cardio',   color: '#2563EB', bg: '#EFF6FF', icon: '❤️',  formType: 'duration'  },
  strength: { key: 'strength', label: 'Strength', color: '#DC2626', bg: '#FEF2F2', icon: '🏋️', formType: 'strength'  },
  stretch:  { key: 'stretch',  label: 'Stretch',  color: '#059669', bg: '#ECFDF5', icon: '🌿',  formType: 'duration'  },
  balance:  { key: 'balance',  label: 'Balance',  color: '#7C3AED', bg: '#F5F3FF', icon: '⚖️',  formType: 'balance'   },
};

export const CAT_KEYS = ['cardio', 'strength', 'stretch', 'balance'];

// Targets for 100% ring fill — all count-based (number of checked exercises)
export const TARGETS = {
  cardio:   1,
  strength: 4,
  stretch:  3,
  balance:  2,
};

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Seeded into the plan the first time the app runs (before any plan exists)
export const DEFAULT_PLAN = {
  cardio:   ['Swimming', 'Cycling', 'Walking'],
  strength: ['RDL', 'Single Leg RDL', 'Banded Side Walk', 'Glute Bridges', 'Plank', 'Side Plank', 'Push-ups'],
  stretch:  ['Neck', 'Shoulders', 'Arms (up, side, back)', 'Hamstring', 'Downward Dog', 'Cat-Cow', 'Child Pose', 'Figure 4'],
  balance:  ['Warrior III', 'Single Leg Side Rotation', 'Single Leg Eyes Closed'],
};

// Built-in suggestions when adding exercises to the plan
export const EXERCISE_LIBRARY = {
  cardio:   ['Running', 'Swimming', 'Cycling', 'Rowing', 'HIIT', 'Jump Rope', 'Elliptical', 'Walking'],
  strength: ['Squat', 'Deadlift', 'RDL', 'Bench Press', 'Pull-ups', 'OHP', 'Lunges', 'Barbell Row', 'Hip Thrust', 'Leg Press'],
  stretch:  ['Hip Flexor', 'Hamstring', 'Chest Opener', 'Pigeon Pose', 'Cobra', "Child's Pose", 'Cat-Cow'],
  balance:  ['Single Leg Stand', 'Bosu Ball Squat', 'Tree Pose', 'Warrior III', 'Tandem Walk'],
};
