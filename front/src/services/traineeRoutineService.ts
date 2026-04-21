import { fetchJson, postJson, del } from "./api";

export const getTraineeRoutines = (traineeId: string) =>
  fetchJson<Array<any>>(`/trainee-routines?trainee_id=${traineeId}`);

export const assignRoutine = (traineeId: string, routineId: string) =>
  postJson("/trainee-routines", { trainee_id: traineeId, routine_id: routineId });

export const unassignRoutine = (traineeId: string) =>
  del(`/trainee-routines?trainee_id=${traineeId}`);
