import API_BASE_URL from "../config/api";
import { fetchJson, postJson, putJson, del } from "./api";
import { getToken } from "./authService";
import type { TraineeData } from "../types/api";

export const getTrainees = () => fetchJson<TraineeData[]>("/trainees");

export const getTrainee = (id: string) => fetchJson<TraineeData>(`/trainees/${id}`);

export const createTrainee = (data: any) => postJson<TraineeData>("/trainees", data);

export const updateTrainee = (id: string, data: any) => putJson<TraineeData>(`/trainees/${id}`, data);

export const deleteTrainee = (id: string) => del(`/trainees/${id}`);

export const getTraineeRoutineFull = (id: string) => fetchJson<any>(`/trainees/${id}/routine/full`);

export const uploadTraineePhoto = async (id: string, file: File) => {
  const fd = new FormData();
  fd.append('photo', file);
  const res = await fetch(`${API_BASE_URL}/trainees/${id}/photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: fd,
  });
  if (!res.ok) throw new Error('Upload failed');
};

export const deleteTraineePhoto = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/trainees/${id}/photo`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Delete failed');
};

export const traineePhotoUrl = (id: string, v?: number) =>
  `${API_BASE_URL}/trainees/${id}/photo${v ? `?v=${v}` : ''}`;
