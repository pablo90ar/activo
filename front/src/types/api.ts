export interface TraineeData {
  trainee_id: string;
  name: string;
  document: string;
  birth_date: string;
  gender: number;
  goal: string;
  color: string;
  routine_name: string | null;
  routine_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseData {
  exercise_id: string;
  name: string;
  description: string;
  routine_count: number;
  tag_ids: string | null;
  tags: string | null;
}

export interface RoutineData {
  routine_id: string;
  name: string;
  description: string;
  is_template: number;
  trainee_count: number;
  day_count: number;
}

export interface ExerciseTag {
  group_id: string;
  name: string;
  exercise_count?: number;
}

export interface RoutineRef {
  routine_id: string;
  name: string;
}

export interface HistoryRow {
  history_id: string;
  completed_date: string;
  trainee_id: string;
  trainee_name: string;
  routine_id: string;
  routine_name: string;
  training_day_id: string;
  day_name: string;
  day_order: number;
  total_days: number;
}

export interface PaginatedResponse<T> {
  items: Array<T>;
  total: number;
}
