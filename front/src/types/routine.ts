export interface ExerciseOption {
  exercise_id: string;
  name: string;
}

export interface ExerciseSetForm {
  exercise_set_id?: string;
  exercise_id: string;
  exercise_name: string;
  weight: number;
  repetitions: number;
  work_time: number;
  rest_time: number;
  other_text: string;
}

export interface DaySetForm {
  day_set_id?: string;
  iterations: number;
  is_warmup?: boolean;
  is_circuit: boolean;
  work_time: number;
  rest_time: number;
  exercises: ExerciseSetForm[];
}

export interface DayForm {
  training_day_id?: string;
  name: string;
  sets: DaySetForm[];
}

export interface RoutineForm {
  name: string;
  description: string;
  is_template: boolean;
  days: DayForm[];
}

export const emptyExercise = (): ExerciseSetForm => ({
  exercise_id: "",
  exercise_name: "",
  weight: 0,
  repetitions: 0,
  work_time: 0,
  rest_time: 0,
  other_text: "",
});

export const emptySet = (): DaySetForm => ({
  iterations: 3,
  is_circuit: false,
  work_time: 0,
  rest_time: 0,
  exercises: [emptyExercise()],
});

export const emptyDay = (index: number): DayForm => ({
  name: `Día ${index + 1}`,
  sets: [emptySet()],
});
