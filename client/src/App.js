import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import CapturePage from "./routes/CapturePage";
import LandingPage from "./routes/LandingPage";
import LoginPage from "./routes/LoginPage";
import QuizPage from "./routes/QuizPage";
import ResultsPage from "./routes/ResultsPage";
import StudyPage from "./routes/StudyPage";
function guarded(node) {
    return _jsx(ErrorBoundary, { children: node });
}
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: guarded(_jsx(LandingPage, {})) }), _jsx(Route, { path: "/landing", element: _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "/login", element: guarded(_jsx(LoginPage, {})) }), _jsx(Route, { path: "/app", element: guarded(_jsx(CapturePage, {})) }), _jsx(Route, { path: "/study/:id", element: guarded(_jsx(StudyPage, {})) }), _jsx(Route, { path: "/quiz/:id", element: guarded(_jsx(QuizPage, {})) }), _jsx(Route, { path: "/results/:attemptId", element: guarded(_jsx(ResultsPage, {})) })] }));
}
