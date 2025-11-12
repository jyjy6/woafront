export type IntensityType = 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5' | 'LEVEL_6' | 'LEVEL_7' | 'LEVEL_8' | 'LEVEL_9' | 'LEVEL_10';

export interface WorkoutItem {
  id: number;
  memberId: number;
  workoutType: string;
  exerciseName: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  durationMinutes: number | null;
  distanceKm: number | null;
  workoutDate: string;
  intensity: IntensityType | null;
  notes: string | null;
}
