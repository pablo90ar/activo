import { fetchJson, postJson, putJson, del } from "./api";
import type { RoutineData } from "../types/api";

export const getRoutines = (params?: { is_template?: boolean }) => {
  const qs = params?.is_template === false ? "?is_template=false" : "";
  return fetchJson<RoutineData[]>(`/routines${qs}`);
};

export const getRoutineFull = (id: string) => fetchJson<any>(`/routines/${id}/full`);

export const createRoutine = (data: any) => postJson<any>("/routines", data);

export const updateRoutine = (id: string, data: any) => putJson<any>(`/routines/${id}`, data);

export const deleteRoutine = (id: string) => del(`/routines/${id}`);

export const duplicateRoutine = (id: string) => postJson(`/routines/${id}/duplicate`, {});

export const getRoutineTrainees = (id: string) => fetchJson<{ trainee_id: string; name: string; color: string }[]>(`/routines/${id}/trainees`);
