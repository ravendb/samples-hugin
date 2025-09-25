import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import "./styles/styles.css";
import AppHeader from "./components/AppHeader";
import SearchPage from "./pages/SearchPage";
import QuestionPage from "./pages/QuestionPage";
import HowPage from "./pages/How";
import { useEffect } from "react";
import { connectivityService } from "./services/connectivity.service";

function App() {
  useEffect(() => {
    // Start global connectivity checking
    connectivityService.start();

    // Cleanup on unmount
    return () => {
      connectivityService.stop();
    };
  }, []);

  return (
    <>
      <AppHeader />
      <Routes>
        <Route index element={<Navigate replace to="/home" />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/question" element={<QuestionPage />} />
        <Route path="/how" element={<HowPage />} />
      </Routes>
    </>
  );
}

export default App;
