// Thin API client — the only place that talks to the backend.

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${res.status}`);
  }
  return res.json();
}

export const getHealth = () => request("/health");
export const getMeta = () => request("/meta");
export const getTransactions = (limit = 25) =>
  request(`/transactions?limit=${limit}`);
export const processTransaction = (payload) =>
  request("/transaction/process", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const triggerSync = () => request("/sync", { method: "POST" });
