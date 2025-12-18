import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNote } from "../api/client";
import { NoteForm } from "../components/NoteForm";
import { useToasts } from "../components/ToastProvider";

// PUBLIC_INTERFACE
export function CreateNotePage() {
  /** Create note view (title/content) with validation and network error handling. */
  const navigate = useNavigate();
  const toasts = useToasts();

  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");

  const onSubmit = async (draft) => {
    setBusy(true);
    setServerError("");
    try {
      const created = await createNote(draft);
      const id = created?.id ?? created?._id ?? created?.noteId;
      toasts.success("Note created.");
      if (id !== undefined && id !== null) {
        navigate(`/notes/${encodeURIComponent(id)}`);
      } else {
        navigate("/");
      }
    } catch (e) {
      setServerError(e.message || "Failed to create note.");
      toasts.error(e.message || "Failed to create note.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="layout">
      <div className="toolbar">
        <div>
          <h1 className="page-title">New note</h1>
          <div className="page-subtitle">Add a title and some content.</div>
        </div>
      </div>

      <NoteForm
        initialValue={{ title: "", content: "" }}
        submitLabel="Create"
        busy={busy}
        serverError={serverError}
        onCancel={() => navigate("/")}
        onSubmit={onSubmit}
      />
    </div>
  );
}
