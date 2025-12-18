import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

let nextToastId = 1;

/**
 * @typedef {"info"|"success"|"error"} ToastKind
 * @typedef {{ id: number, kind: ToastKind, message: string }} Toast
 */

// PUBLIC_INTERFACE
export function ToastProvider({ children }) {
  /** Provides toast methods and renders toast UI. */
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((kind, message, options = {}) => {
    const id = nextToastId++;
    const toast = { id, kind, message };
    setToasts((prev) => [toast, ...prev].slice(0, 4));

    const timeoutMs = options.timeoutMs ?? 3500;
    window.setTimeout(() => removeToast(id), timeoutMs);

    return id;
  }, [removeToast]);

  const api = useMemo(
    () => ({
      // PUBLIC_INTERFACE
      info: (message, options) => {
        /** Show an informational toast. */
        return pushToast("info", message, options);
      },
      // PUBLIC_INTERFACE
      success: (message, options) => {
        /** Show a success toast. */
        return pushToast("success", message, options);
      },
      // PUBLIC_INTERFACE
      error: (message, options) => {
        /** Show an error toast. */
        return pushToast("error", message, options);
      },
    }),
    [pushToast]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" aria-live="polite" aria-relevant="additions removals">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`} role="status">
            <div className="toast-message">{t.message}</div>
            <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Dismiss notification">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToasts() {
  /** Access toast helpers. Must be used within ToastProvider. */
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToasts must be used within ToastProvider");
  }
  return ctx;
}
