import { useCallback, useEffect, useState } from "react";
import "../styles/components/app-header.css";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { queryQuestions } from "../services/data.service";
import { useDispatch } from "react-redux";
import { setQueryResult } from "../store/questionSlice";

function AppHeader() {
  const [searchParams, setSearchParams] = useSearchParams();
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
    let url = `/search?q=${searchTerm}`;
    const community = searchParams.get("community");
    if (community) url += "&community=" + community;

    const tag = searchParams.get("tag");
    if (tag) url += "&tag=" + tag;

    navigate(url);
  }

  function inputChangeHandler(e) {
    setSearchTerm(e.target.value);
    setSearchParams({ q: e.target.value });
  }

  function handleTitleClick() {
    navigate("/home");
  }

  useEffect(() => {
    console.log("search params: ", searchParams.q);
    const community = searchParams.get("community");
    const tag = searchParams.get("tag");
    const q = searchParams.get("q");
    setSearchTerm(q || "");
    onSearch({ community, q, tag });
  }, [searchParams, location.search, onSearch]);

  return (
    <header className="hero">
      <img src="/img/hero.jpg" className="hero-img" alt="raven-logo" />
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title" onClick={handleTitleClick}>
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
