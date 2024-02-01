import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import "./styles/styles.css";
import AppHeader from "./components/AppHeader";
import SearchPage from "./pages/SearchPage";
import QuestionPage from "./pages/QuestionPage";
import HowPage from "./pages/How";
import RedirectPage from "./pages/Redirect";


function App() {
  return (
    <>
      <AppHeader />
      <Routes>
        <Route index element={<Navigate replace to="/home" />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/question" element={<QuestionPage />} />
        <Route path="/how" element={<HowPage />} />
        <Route path="/redirect" element={<RedirectPage />} />
      </Routes>
    </>
  );
}

export default App;
