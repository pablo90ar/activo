import { fetchJson, putJson } from "./api";
import API_BASE_URL from "../config/api";
import { getToken } from "./authService";

export const getSettings = () => fetchJson<Record<string, unknown>>("/settings");

export const updateSettings = (data: Record<string, unknown>) =>
  putJson<Record<string, unknown>>("/settings", data);

export const getLogoUrl = () => `${API_BASE_URL}/settings/logo`;

export const uploadLogo = (file: File) => {
  const form = new FormData();
  form.append("logo", file);
  return fetch(`${API_BASE_URL}/settings/logo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: form,
  }).then((r) => { if (!r.ok) throw new Error(`Error: ${r.status}`); return r.json(); });
};
