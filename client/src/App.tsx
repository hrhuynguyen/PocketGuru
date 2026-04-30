import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";

import { useMe } from "./lib/queries";
import CapturePage from "./routes/CapturePage";
import LandingPage from "./routes/LandingPage";
import LoginPage from "./routes/LoginPage";
import QuizPage from "./routes/QuizPage";
import ResultsPage from "./routes/ResultsPage";
import StudyPage from "./routes/StudyPage";

const ENTRY_KEY = "pg.entered";

export function markEntered() {
  try {
    localStorage.setItem(ENTRY_KEY, "1");
  } catch {
    // storage disabled — guard will fall back to fresh /me check
  }
}

export function clearEntered() {
  try {
    localStorage.removeItem(ENTRY_KEY);
  } catch {
    // ignore
  }
}

function hasEntered() {
  try {
    return localStorage.getItem(ENTRY_KEY) === "1";
  } catch {
    return false;
  }
}

function RequireEntry({ children }: { children: ReactNode }) {
  const me = useMe();

  if (me.isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          color: "var(--ink-3)",
          fontWeight: 700,
        }}
      >
        Loading…
      </div>
    );
  }

  const isAuthed = me.data && me.data.anonymous === false;
  if (!isAuthed && !hasEntered()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/app"
        element={
          <RequireEntry>
            <CapturePage />
          </RequireEntry>
        }
      />
      <Route
        path="/study/:id"
        element={
          <RequireEntry>
            <StudyPage />
          </RequireEntry>
        }
      />
      <Route
        path="/quiz/:id"
        element={
          <RequireEntry>
            <QuizPage />
          </RequireEntry>
        }
      />
      <Route
        path="/results/:attemptId"
        element={
          <RequireEntry>
            <ResultsPage />
          </RequireEntry>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
