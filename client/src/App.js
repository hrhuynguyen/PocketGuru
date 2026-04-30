import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
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
    }
    catch {
        // storage disabled — guard will fall back to fresh /me check
    }
}
export function clearEntered() {
    try {
        localStorage.removeItem(ENTRY_KEY);
    }
    catch {
        // ignore
    }
}
function hasEntered() {
    try {
        return localStorage.getItem(ENTRY_KEY) === "1";
    }
    catch {
        return false;
    }
}
function RequireEntry({ children }) {
    const me = useMe();
    if (me.isLoading) {
        return (_jsx("div", { style: {
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg)",
                color: "var(--ink-3)",
                fontWeight: 700,
            }, children: "Loading\u2026" }));
    }
    const isAuthed = me.data && me.data.anonymous === false;
    if (!isAuthed && !hasEntered()) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/app", element: _jsx(RequireEntry, { children: _jsx(CapturePage, {}) }) }), _jsx(Route, { path: "/study/:id", element: _jsx(RequireEntry, { children: _jsx(StudyPage, {}) }) }), _jsx(Route, { path: "/quiz/:id", element: _jsx(RequireEntry, { children: _jsx(QuizPage, {}) }) }), _jsx(Route, { path: "/results/:attemptId", element: _jsx(RequireEntry, { children: _jsx(ResultsPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
