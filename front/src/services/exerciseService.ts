import { fetchJson, postJson, putJson, del } from "./api";
import type { ExerciseData, PaginatedResponse } from "../types/api";

export const getExercises = () =>
  fetchJson<PaginatedResponse<ExerciseData>>("/exercises?limit=10000").then((r) => r.items);

export const getExercisesPaginated = (params: {
  offset?: number;
  limit?: number;
  search?: string;
  groups?: Array<string>;
  filterEmpty?: boolean;
}) => {
  const q = new URLSearchParams();
  if (params.offset) q.set('offset', String(params.offset));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.groups?.length) q.set('groups', params.groups.join(','));
  if (params.filterEmpty) q.set('filterEmpty', '1');
  return fetchJson<PaginatedResponse<ExerciseData>>(`/exercises?${q}`);
};

export const getExercise = (id: string) => fetchJson<ExerciseData>(`/exercises/${id}`);

export const createExercise = (data: { name: string; description?: string; tag_ids?: Array<string> }) =>
  postJson<ExerciseData>("/exercises", data);

export const updateExercise = (id: string, data: { name: string; description?: string; tag_ids?: Array<string> }) =>
  putJson<ExerciseData>(`/exercises/${id}`, data);

export const deleteExercise = (id: string) => del(`/exercises/${id}`);

export const getExerciseRoutines = (id: string) => fetchJson<Array<{ routine_id: string; name: string }>>(`/exercises/${id}/routines`);

export const mergeExercises = (sourceIds: string[], targetId: string) =>
  postJson<{ ok: boolean }>("/exercises/merge", { sourceIds, targetId });
