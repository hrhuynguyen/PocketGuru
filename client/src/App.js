import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes } from "react-router-dom";
import CapturePage from "./routes/CapturePage";
import QuizPage from "./routes/QuizPage";
import ResultsPage from "./routes/ResultsPage";
import StudyPage from "./routes/StudyPage";
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(CapturePage, {}) }), _jsx(Route, { path: "/study/:id", element: _jsx(StudyPage, {}) }), _jsx(Route, { path: "/quiz/:id", element: _jsx(QuizPage, {}) }), _jsx(Route, { path: "/results/:attemptId", element: _jsx(ResultsPage, {}) })] }));
}
