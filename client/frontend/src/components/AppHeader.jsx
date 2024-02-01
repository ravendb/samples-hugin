import { useCallback, useEffect, useState } from "react";
import "../styles/components/app-header.css";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { queryQuestions } from "../services/data.service";
import { useDispatch } from "react-redux";
import { setQueryResult } from "../store/questionSlice";

function AppHeader() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  const onSearch = useCallback(
    async (args) => {
      const q = await queryQuestions(args);
      dispatch(setQueryResult(q));
    },
    [dispatch]
  );

  function onSearchClick() {
    let url = "/search";
    if (searchTerm) url += `?q=${searchTerm}`;
    const community = searchParams.get("community");
    if (community) url += `&community=${community}`;
    const tag = searchParams.get("tag");
    if (tag) url += `&tag=${tag}`;
    navigate(url);
  }

  function inputChangeHandler(e) {
    setSearchTerm(e.target.value);
  }

  function handleTitleClick() {
    navigate("/home");
  }

  function searchKeyUp(e) {
    if (e.key === "Enter") onSearchClick();
  }

  useEffect(() => {
    const community = searchParams.get("community");
    const tag = searchParams.get("tag");
    const q = searchParams.get("q");
    const page = searchParams.get("page") || 0;
    const orderBy = searchParams.get("orderBy") || "CreationDate";
    setSearchTerm(q || "");
    if (!q && !community && !tag) return;
    onSearch({ community, q, tag, page, orderBy });
  }, [searchParams, location.search, onSearch]);

  return (
    <header className="hero">
      <img src="/img/hero.jpg" className="hero-img" alt="raven-logo" onClick={handleTitleClick} />
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title" onClick={handleTitleClick}>
            <img
              src="/img/ravendb-logo.svg"
              className="hero-logo"
              alt="RavenDB"
            />
            Hugin
          </h1>
          <h2>Offline knowledge base</h2>
          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search database"
              value={searchTerm}
              onChange={inputChangeHandler}
              onKeyUp={searchKeyUp}
            />
            <button
              className="search-btn"
              type="button"
              onClick={onSearchClick}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
