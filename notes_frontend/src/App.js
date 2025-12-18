import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { ToastProvider } from "./components/ToastProvider";
import { NotesListPage } from "./pages/NotesListPage";
import { CreateNotePage } from "./pages/CreateNotePage";
import { EditNotePage } from "./pages/EditNotePage";
import { getResolvedApiBase } from "./api/client";

// PUBLIC_INTERFACE
function App() {
  /** Application entry component: layout shell + routes for notes list/create/edit. */
  const apiBase = getResolvedApiBase();

  return (
    <ToastProvider>
      <div className="app-shell">
        <header className="app-header">
          <div className="container header-inner">
            <div className="brand">
              <div className="brand-mark" aria-hidden="true">
                N
              </div>
              <div className="brand-text">
                <div className="brand-title">Notes</div>
                <div className="brand-subtitle">Simple notes app</div>
              </div>
            </div>

            <div className="header-meta">
              <span className="badge" title={`API base resolved from env vars (REACT_APP_API_BASE preferred).`}>
                API: {apiBase}
              </span>
            </div>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={<NotesListPage />} />
              <Route path="/new" element={<CreateNotePage />} />
              <Route path="/notes/:id" element={<EditNotePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        <footer className="app-footer">
          <div className="container footer-inner">
            <span className="muted">Built with React • CRUD via REST API</span>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}

export default App;
