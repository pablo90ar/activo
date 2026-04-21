import API_BASE_URL from "../config/api";
import { getToken, clearToken } from "./authService";

function authHeaders(headers?: HeadersInit): HeadersInit {
  const token = getToken();
  const h = new Headers(headers);
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h;
}

function handle401(res: Response) {
  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
  }
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: authHeaders(init?.headers) });
  if (!res.ok) { handle401(res); throw new Error(`Error: ${res.status}`); }
  return res.json();
}

export function postJson<T>(path: string, body: unknown): Promise<T> {
  return fetchJson(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function putJson<T>(path: string, body: unknown): Promise<T> {
  return fetchJson(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function del<T = void>(path: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method: "DELETE" };
  if (body) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: authHeaders(init.headers) });
  if (!res.ok) { handle401(res); throw new Error(`Error: ${res.status}`); }
  if (res.status === 204) return undefined as T;
  return res.json();
}
