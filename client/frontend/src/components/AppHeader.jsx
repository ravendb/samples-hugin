import { useEffect, useState } from "react";
import "../styles/components/app-header.css";
import { useSearchParams } from "react-router-dom";
import { getQuestions } from "../services/data.service";
import { useDispatch } from "react-redux";
import { setQuestions } from "../store/questionSlice";

function AppHeader() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("term") || "");

  function onSearch() {
    const q = getQuestions();
    dispatch(setQuestions(q));
  }

  useEffect(() => {
    if (searchTerm) onSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="hero">
      <img src="/img/hero.jpg" className="hero-img" alt="raven-logo" />
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            <img
              src="/img/ravendb-logo.svg"
              className="hero-logo"
              alt="RavenDB"
            />
            offline knowledge base!
          </h1>
          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search database"
              defaultValue={searchTerm}
            />
            <button className="search-btn" type="button">
              Search
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
