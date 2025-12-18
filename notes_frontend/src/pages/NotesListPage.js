import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteNote, listNotes } from "../api/client";
import { useToasts } from "../components/ToastProvider";

function snippet(text, maxLen = 120) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  return clean.length > maxLen ? `${clean.slice(0, maxLen)}…` : clean;
}

function normalizeNote(raw) {
  // Defensive normalization: backend may return `_id`, `id`, etc.
  const id = raw?.id ?? raw?._id ?? raw?.noteId;
  return {
    id,
    title: raw?.title ?? "",
    content: raw?.content ?? "",
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
}

// PUBLIC_INTERFACE
export function NotesListPage() {
  /** Displays notes list and provides navigation to create/edit plus delete actions. */
  const navigate = useNavigate();
  const toasts = useToasts();

  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listNotes();
      const arr = Array.isArray(data) ? data : data?.notes || [];
      setNotes(arr.map(normalizeNote).filter((n) => n.id !== undefined && n.id !== null));
    } catch (e) {
      setError(e.message || "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedNotes = useMemo(() => {
    // If timestamps exist, sort by updated/created desc; otherwise keep original
    const withTs = notes.filter((n) => n.updatedAt || n.createdAt);
    if (withTs.length === 0) return notes;

    return [...notes].sort((a, b) => {
      const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return tb - ta;
    });
  }, [notes]);

  const onDelete = async (note) => {
    const ok = window.confirm(`Delete "${note.title || "Untitled"}"? This cannot be undone.`);
    if (!ok) return;

    setDeletingId(note.id);
    try {
      await deleteNote(note.id);
      toasts.success("Note deleted.");
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
    } catch (e) {
      toasts.error(e.message || "Failed to delete note.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="layout">
      <div className="toolbar">
        <div>
          <h1 className="page-title">Notes</h1>
          <div className="page-subtitle">Create, edit, and organize your notes.</div>
        </div>

        <div className="toolbar-actions">
          <button className="btn btn-secondary" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <Link className="btn btn-primary" to="/new">
            New note
          </Link>
        </div>
      </div>

      {error ? (
        <div className="alert alert-error">
          <div className="alert-title">Couldn’t load notes</div>
          <div className="alert-body">{error}</div>
          <div className="alert-actions">
            <button className="btn btn-primary" onClick={load}>
              Try again
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid">
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">All notes</div>
            <div className="panel-meta">{loading ? "Loading..." : `${sortedNotes.length} total`}</div>
          </div>

          {loading ? (
            <div className="list">
              {[0, 1, 2, 3].map((k) => (
                <div className="note-row skeleton" key={k}>
                  <div className="skeleton-line w60" />
                  <div className="skeleton-line w90" />
                </div>
              ))}
            </div>
          ) : sortedNotes.length === 0 ? (
            <div className="empty">
              <div className="empty-title">No notes yet</div>
              <div className="empty-body">Create your first note to get started.</div>
              <button className="btn btn-primary" onClick={() => navigate("/new")}>
                Create a note
              </button>
            </div>
          ) : (
            <div className="list">
              {sortedNotes.map((n) => (
                <div key={n.id} className="note-row">
                  <Link className="note-main" to={`/notes/${encodeURIComponent(n.id)}`}>
                    <div className="note-title">{n.title || "Untitled"}</div>
                    <div className="note-snippet">{snippet(n.content)}</div>
                  </Link>
                  <div className="note-actions">
                    <Link className="btn btn-ghost" to={`/notes/${encodeURIComponent(n.id)}`}>
                      Edit
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(n)}
                      disabled={deletingId === n.id}
                    >
                      {deletingId === n.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="panel panel-aside">
          <div className="panel-header">
            <div className="panel-title">Tips</div>
          </div>
          <div className="aside-body">
            <ul className="bullets">
              <li>Click a note to edit it.</li>
              <li>Use “New note” to create quickly.</li>
              <li>Delete requires confirmation.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
