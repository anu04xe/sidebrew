import type { BriefResponse, ImportResult } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

async function safeJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "Request failed";
    try {
      const body = await response.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export async function seedData() {
  const response = await fetch(`${API_BASE}/api/seed`, { method: "POST" });
  return safeJson<{ message: string }>(response);
}

export async function fetchBrief(store?: string) {
  const qs = store && store !== "All stores" ? `?store=${encodeURIComponent(store)}` : "";
  const response = await fetch(`${API_BASE}/api/brief/latest${qs}`);
  return safeJson<BriefResponse>(response);
}

export async function fetchCopyBrief(store?: string) {
  const qs = store && store !== "All stores" ? `?store=${encodeURIComponent(store)}` : "";
  const response = await fetch(`${API_BASE}/api/brief/copy${qs}`);
  return safeJson<{ text: string }>(response);
}

export async function importCsv(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE}/api/import/sales`, {
    method: "POST",
    body: formData,
  });
  return safeJson<ImportResult>(response);
}

export function pdfLink(store?: string) {
  const qs = store && store !== "All stores" ? `?store=${encodeURIComponent(store)}` : "";
  return `${API_BASE}/api/brief/pdf${qs}`;
}
