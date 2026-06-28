// formType: 'duration' | 'strength' | 'balance'
export const CATEGORIES = {
  cardio:   { key: 'cardio',   label: 'Cardio',   color: '#2563EB', bg: '#EFF6FF', icon: '❤️',  formType: 'duration'  },
  strength: { key: 'strength', label: 'Strength', color: '#DC2626', bg: '#FEF2F2', icon: '🏋️', formType: 'strength'  },
  stretch:  { key: 'stretch',  label: 'Stretch',  color: '#059669', bg: '#ECFDF5', icon: '🌿',  formType: 'duration'  },
  balance:  { key: 'balance',  label: 'Balance',  color: '#7C3AED', bg: '#F5F3FF', icon: '⚖️',  formType: 'balance'   },
};

export const CAT_KEYS = ['cardio', 'strength', 'stretch', 'balance'];

export const TARGETS = {
  cardio:   { kind: 'minutes',  value: 45 },
  strength: { kind: 'sessions', value: 3  },
  stretch:  { kind: 'minutes',  value: 20 },
  balance:  { kind: 'sessions', value: 2  },
};

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Built-in exercise library — shown after user history
export const EXERCISE_LIBRARY = {
  cardio:   ['Running', 'Swimming', 'Cycling', 'Rowing', 'HIIT', 'Jump Rope', 'Elliptical', 'Walking'],
  strength: ['Squat', 'Deadlift', 'RDL', 'Bench Press', 'Pull-ups', 'OHP', 'Lunges', 'Barbell Row', 'Hip Thrust', 'Leg Press'],
  stretch:  ['Hip Flexor', 'Hamstring', 'Chest Opener', 'Pigeon Pose', 'Cobra', "Child's Pose", 'Cat-Cow'],
  balance:  ['Single Leg Stand', 'Bosu Ball Squat', 'Tree Pose', 'Warrior III', 'Tandem Walk'],
};
