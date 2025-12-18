import React, { useMemo, useState } from "react";

/**
 * @typedef {{ title: string, content: string }} NoteDraft
 */

function validate(draft) {
  const errors = {};
  if (!draft.title.trim()) errors.title = "Title is required.";
  if (draft.title.trim().length > 120) errors.title = "Title must be 120 characters or fewer.";
  if (!draft.content.trim()) errors.content = "Content is required.";
  if (draft.content.length > 20000) errors.content = "Content is too long.";
  return errors;
}

// PUBLIC_INTERFACE
export function NoteForm({
  initialValue,
  submitLabel,
  onSubmit,
  onCancel,
  busy = false,
  serverError = "",
}) {
  /**
   * Note form used for both create and edit.
   * - Validates title/content
   * - Disables actions while busy
   */
  const [draft, setDraft] = useState(() => ({
    title: initialValue?.title ?? "",
    content: initialValue?.content ?? "",
  }));
  const [touched, setTouched] = useState({ title: false, content: false });

  const errors = useMemo(() => validate(draft), [draft]);
  const canSubmit = Object.keys(errors).length === 0 && !busy;

  const showTitleError = touched.title && errors.title;
  const showContentError = touched.content && errors.content;

  return (
    <form
      className="card form"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched({ title: true, content: true });
        const currentErrors = validate(draft);
        if (Object.keys(currentErrors).length > 0) return;
        onSubmit({ title: draft.title.trim(), content: draft.content });
      }}
    >
      <div className="form-header">
        <div className="form-title">Note</div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {busy ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>

      {serverError ? <div className="alert alert-error">{serverError}</div> : null}

      <div className="field">
        <label className="label" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className={`input ${showTitleError ? "input-invalid" : ""}`}
          type="text"
          value={draft.title}
          onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
          onBlur={() => setTouched((p) => ({ ...p, title: true }))}
          placeholder="e.g., Meeting notes"
          maxLength={200}
          autoFocus
        />
        {showTitleError ? <div className="field-error">{errors.title}</div> : null}
      </div>

      <div className="field">
        <label className="label" htmlFor="content">
          Content
        </label>
        <textarea
          id="content"
          className={`textarea ${showContentError ? "input-invalid" : ""}`}
          value={draft.content}
          onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
          onBlur={() => setTouched((p) => ({ ...p, content: true }))}
          placeholder="Write your note..."
          rows={10}
        />
        {showContentError ? <div className="field-error">{errors.content}</div> : null}
      </div>

      <div className="form-footer">
        <div className="muted">
          Tip: click a note in the list to edit. Changes are saved with the Save button.
        </div>
      </div>
    </form>
  );
}
