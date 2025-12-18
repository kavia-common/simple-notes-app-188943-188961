import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteNote, getNote, updateNote } from "../api/client";
import { NoteForm } from "../components/NoteForm";
import { useToasts } from "../components/ToastProvider";

// PUBLIC_INTERFACE
export function EditNotePage() {
  /** Edit note view; reuses NoteForm and supports delete with confirmation. */
  const { id } = useParams();
  const navigate = useNavigate();
  const toasts = useToasts();

  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState(null);
  const [loadError, setLoadError] = useState("");

  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getNote(id);
        if (!mounted) return;
        setNote({
          id: data?.id ?? data?._id ?? id,
          title: data?.title ?? "",
          content: data?.content ?? "",
          createdAt: data?.createdAt,
          updatedAt: data?.updatedAt,
        });
      } catch (e) {
        if (!mounted) return;
        setLoadError(e.message || "Failed to load note.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  const onSubmit = async (draft) => {
    setBusy(true);
    setServerError("");
    try {
      const updated = await updateNote(id, draft);
      setNote((prev) => ({
        ...(prev || { id }),
        title: updated?.title ?? draft.title,
        content: updated?.content ?? draft.content,
        updatedAt: updated?.updatedAt ?? new Date().toISOString(),
      }));
      toasts.success("Saved.");
      navigate("/");
    } catch (e) {
      setServerError(e.message || "Failed to save note.");
      toasts.error(e.message || "Failed to save note.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    const ok = window.confirm(`Delete "${note?.title || "Untitled"}"? This cannot be undone.`);
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteNote(id);
      toasts.success("Note deleted.");
      navigate("/");
    } catch (e) {
      toasts.error(e.message || "Failed to delete note.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="layout">
      <div className="toolbar">
        <div>
          <h1 className="page-title">Edit note</h1>
          <div className="page-subtitle">
            <Link className="link" to="/">
              ← Back to list
            </Link>
          </div>
        </div>

        <div className="toolbar-actions">
          <button className="btn btn-danger" onClick={onDelete} disabled={loading || deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="skeleton-line w60" />
          <div className="skeleton-line w90" />
          <div className="skeleton-line w80" />
        </div>
      ) : loadError ? (
        <div className="alert alert-error">
          <div className="alert-title">Couldn’t load note</div>
          <div className="alert-body">{loadError}</div>
          <div className="alert-actions">
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Back to list
            </button>
          </div>
        </div>
      ) : (
        <NoteForm
          initialValue={{ title: note?.title || "", content: note?.content || "" }}
          submitLabel="Save"
          busy={busy}
          serverError={serverError}
          onCancel={() => navigate("/")}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}
