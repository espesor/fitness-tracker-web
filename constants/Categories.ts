export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type DayKey = (typeof DAYS)[number];

export interface CategoryConfig {
  key: string;
  label: string;
  color: string;
  lightColor: string;
  bgColor: string;
  /** Ionicons outline icon name */
  icon: string;
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  cardio: {
    key: 'cardio',
    label: 'Cardio',
    color: '#2563EB',
    lightColor: '#BFDBFE',
    bgColor: '#EFF6FF',
    icon: 'heart-outline',
  },
  strength: {
    key: 'strength',
    label: 'Strength',
    color: '#DC2626',
    lightColor: '#FECACA',
    bgColor: '#FEF2F2',
    icon: 'barbell-outline',
  },
  stretch: {
    key: 'stretch',
    label: 'Stretch',
    color: '#059669',
    lightColor: '#A7F3D0',
    bgColor: '#ECFDF5',
    icon: 'body-outline',
  },
  balance: {
    key: 'balance',
    label: 'Balance',
    color: '#7C3AED',
    lightColor: '#DDD6FE',
    bgColor: '#F5F3FF',
    icon: 'walk-outline',
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[];

/** Progress targets used for the ring fill on the Today screen */
export const TARGETS = {
  cardio:   { kind: 'minutes' as const, value: 45 },
  strength: { kind: 'sessions' as const, value: 3 },
  stretch:  { kind: 'minutes' as const, value: 20 },
  balance:  { kind: 'sessions' as const, value: 2 },
};
