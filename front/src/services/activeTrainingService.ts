import { fetchJson, postJson, putJson, del } from "./api";
import { originId } from "../hooks/useTrainingSocket";

export interface ActiveTraining {
  trainee_id: string;
  training_day_id: string;
  started_at: string;
  name: string;
  color: string;
  routine_id: string;
}

export const getActiveTrainings = () => fetchJson<ActiveTraining[]>("/active-training");

export const startTraining = (traineeId: string, trainingDayId: string) =>
  postJson("/active-training", { trainee_id: traineeId, training_day_id: trainingDayId, origin_id: originId });

export const updateActiveDay = (traineeId: string, trainingDayId: string) =>
  putJson(`/active-training/${traineeId}`, { training_day_id: trainingDayId, origin_id: originId });

export const stopTraining = (traineeId: string) => del(`/active-training/${traineeId}?origin_id=${encodeURIComponent(originId)}`);
