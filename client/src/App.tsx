import { Route, Routes } from "react-router-dom";

import CapturePage from "./routes/CapturePage";
import QuizPage from "./routes/QuizPage";
import ResultsPage from "./routes/ResultsPage";
import StudyPage from "./routes/StudyPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CapturePage />} />
      <Route path="/study/:id" element={<StudyPage />} />
      <Route path="/quiz/:id" element={<QuizPage />} />
      <Route path="/results/:attemptId" element={<ResultsPage />} />
    </Routes>
  );
}
