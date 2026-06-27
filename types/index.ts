export type Category = 'cardio' | 'strength' | 'stretch' | 'balance';

export interface Exercise {
  id: string;
  name: string;
  category: Category;
  note: string;
  timestamp: number;
  /** Minutes — used for cardio, stretch, balance */
  duration?: number;
  /** Pounds — used for strength */
  weight?: number;
  sets?: number;
  reps?: number;
}

export interface WeekPlan {
  /** ISO date string for the Monday of this week, e.g. "2025-06-23" */
  weekStart: string;
  /** Day abbreviation → free-text plan, e.g. { Mon: "Bike 30 min, RDL 30 lb 3×7" } */
  days: Record<string, string>;
}
