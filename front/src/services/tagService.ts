import { fetchJson, postJson, putJson, del } from "./api";
import type { ExerciseTag } from "../types/api";

export const getTags = () => fetchJson<ExerciseTag[]>("/tags");

export const createTag = (name: string) => postJson("/tags", { name });

export const updateTag = (id: string, name: string) => putJson(`/tags/${id}`, { name });

export const deleteTag = (id: string) => del(`/tags/${id}`);

export const getTagExercises = (id: string) => fetchJson<{ exercise_id: string; name: string }[]>(`/tags/${id}/exercises`);
