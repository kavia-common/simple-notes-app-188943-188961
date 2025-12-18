const DEFAULT_API_BASE = "/api";

/**
 * Resolve API base URL from environment variables.
 * Preference order:
 * 1) REACT_APP_API_BASE
 * 2) REACT_APP_BACKEND_URL
 * 3) "/api"
 */
function getApiBase() {
  const raw =
    (process.env.REACT_APP_API_BASE || "").trim() ||
    (process.env.REACT_APP_BACKEND_URL || "").trim() ||
    DEFAULT_API_BASE;

  // Normalize: remove trailing slash to avoid "//notes"
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

const API_BASE = getApiBase();

/**
 * Parse error response bodies safely.
 * @param {Response} res
 */
async function readErrorBody(res) {
  const contentType = res.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const json = await res.json();
      // common patterns: {detail}, {message}, string
      if (typeof json === "string") return json;
      if (json?.detail) return String(json.detail);
      if (json?.message) return String(json.message);
      return JSON.stringify(json);
    }
    const text = await res.text();
    return text || `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

/**
 * Perform a JSON request.
 * @param {string} path
 * @param {RequestInit} options
 */
async function requestJson(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await readErrorBody(res);
    const err = new Error(body || "Request failed");
    err.status = res.status;
    err.url = url;
    throw err;
  }

  // Some deletes may return empty body
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * @typedef {{ id: string|number, title: string, content: string, createdAt?: string, updatedAt?: string }} Note
 */

// PUBLIC_INTERFACE
export async function listNotes() {
  /** Fetch all notes. Returns Note[] */
  return requestJson("/notes", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function getNote(id) {
  /** Fetch a single note by id. Returns Note */
  return requestJson(`/notes/${encodeURIComponent(id)}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function createNote(payload) {
  /** Create a note. payload: {title, content}. Returns created Note */
  return requestJson("/notes", { method: "POST", body: JSON.stringify(payload) });
}

// PUBLIC_INTERFACE
export async function updateNote(id, payload) {
  /** Update a note. payload: {title, content}. Returns updated Note */
  return requestJson(`/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Delete a note. Returns null or backend response */
  return requestJson(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// PUBLIC_INTERFACE
export function getResolvedApiBase() {
  /** Get the resolved API base URL (for diagnostics). */
  return API_BASE;
}
