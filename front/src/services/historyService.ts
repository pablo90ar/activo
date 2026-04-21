import { fetchJson, postJson, del } from "./api";
import type { HistoryRow } from "../types/api";
import { originId } from "../hooks/useTrainingSocket";

export const getHistory = (params?: { from?: string; to?: string; trainee_id?: string }) => {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to + "T23:59:59");
  if (params?.trainee_id) qs.set("trainee_id", params.trainee_id);
  const q = qs.toString();
  return fetchJson<HistoryRow[]>(`/history${q ? `?${q}` : ""}`);
};

export const registerTraining = (traineeId: string, routineId: string, trainingDayId: string) =>
  postJson("/history", { trainee_id: traineeId, routine_id: routineId, training_day_id: trainingDayId, origin_id: originId });

export const deleteHistory = (ids: Array<string>) => del("/history", { ids });

export const updateHistoryDate = (id: string, completed_date: string) =>
  fetchJson(`/history/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed_date }),
  });

export const duplicateHistory = (id: string, completed_date?: string) =>
  postJson(`/history/${id}/duplicate`, { completed_date });

export interface SnapshotSet {
  set_order: number;
  iterations: number;
  is_circuit: number;
  work_time: number;
  rest_time: number;
  exercises: Array<{ exercise_name: string; repetitions: number; weight: number; other_text: string }>;
}

export const getHistorySnapshot = (id: string) =>
  fetchJson<SnapshotSet[]>(`/history/${id}/snapshot`);
