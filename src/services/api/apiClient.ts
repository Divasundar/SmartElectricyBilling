// ============================================================
// SMART BILLING - Base API Client
// ============================================================

export const API_BASE_URL = 'http://localhost:8080/api';

export type ApiMode = 'backend' | 'mock';

let _apiMode: ApiMode = 'mock';
export const getApiMode = () => _apiMode;
export const setApiMode = (mode: ApiMode) => { _apiMode = mode; };

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(API_BASE_URL + '/tariffs', {
      signal: controller.signal,
      method: 'GET',
    });
    clearTimeout(timer);
    return resp.ok;
  } catch {
    return false;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const resp = await fetch(API_BASE_URL + path, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(err || 'GET ' + path + ' failed: ' + String(resp.status));
  }
  return resp.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const resp = await fetch(API_BASE_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(err || 'POST ' + path + ' failed: ' + String(resp.status));
  }
  return resp.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const resp = await fetch(API_BASE_URL + path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(err || 'PUT ' + path + ' failed: ' + String(resp.status));
  }
  return resp.json() as Promise<T>;
}

export async function apiDelete(path: string): Promise<void> {
  const resp = await fetch(API_BASE_URL + path, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(err || 'DELETE ' + path + ' failed: ' + String(resp.status));
  }
}