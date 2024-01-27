import { useCallback, useEffect, useState } from "react";
import "../styles/components/app-header.css";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { getQuestions } from "../services/data.service";
import { useDispatch } from "react-redux";
import { setQuestions } from "../store/questionSlice";

function AppHeader() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const community = searchParams.get("community");
  const tag = searchParams.get("tag");

  const onSearch = useCallback(async (args) => {
    const q = await getQuestions(args);
    dispatch(setQuestions(q));
  }, [dispatch]);
  function onSearchClick() {
    navigate(`/search?q=${searchTerm}`);
  }

  function inputChangeHandler(e) {
    setSearchTerm(e.target.value);
  }

  useEffect(() => {
    const community = searchParams.get("community");
    setSearchTerm(community || "");
    if (!community) return;
    onSearch({ community, });
  }, [searchParams, location.search, onSearch]);

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
              onChange={inputChangeHandler}
            />
            <button className="search-btn" type="button" onClick={onSearchClick}>
              Search
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
