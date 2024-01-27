import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import "./styles/base.css";
import AppHeader from "./components/AppHeader";
import SearchPage from "./pages/SearchPage";
import QuestionPage from "./pages/QuestionPage";

function App() {
  return (
    <div>
      <AppHeader />
      <Routes>
        <Route index element={<Navigate replace to="/home" />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/question/:id" element={<QuestionPage />} />
      </Routes>
    </div>
  );
}

export default App;
