import { useCallback, useEffect, useRef, useState } from "react";
import "../styles/components/app-header.css";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  queryQuestionsProgressive,
} from "../services/data.service";
import {
  beginSearch,
  getServerResult,
  setAiPhase,
  setAiResult,
  setNormalResult,
  setSearchError,
} from "../store/store";
import AiSearchToggle from "./AiSearchToggle";

function AppHeader() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { searchResult } = getServerResult();
  const currentRequest = useRef(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  const runSearch = useCallback((args) => {
    currentRequest.current?.abort();
    dispatch(beginSearch(args.q || ""));
    currentRequest.current = queryQuestionsProgressive(
      { ...args, aiEnabled: searchResult.aiEnabled },
      {
        onNormal: (result) => dispatch(setNormalResult(result)),
        onAiStart: () => dispatch(setAiPhase("running")),
        onAi: (result) => dispatch(setAiResult(result)),
        onError: (message) => dispatch(setSearchError(message)),
      },
    );
  }, [dispatch, searchResult.aiEnabled]);

  useEffect(() => () => currentRequest.current?.abort(), []);

  useEffect(() => {
    const q = searchParams.get("q");
    const community = searchParams.get("community");
    const tags = searchParams.getAll("tag");
    setSearchTerm(q || "");
    if (!q && !community && tags.length === 0) return;
    runSearch({
      q,
      community,
      tag: tags,
      page: searchParams.get("page") || 0,
      orderBy: searchParams.get("orderBy") || "CreationDate",
    });
    return () => currentRequest.current?.abort();
  }, [location.search, runSearch, searchParams]);

  function navigateToSearch() {
    const next = new URLSearchParams();
    if (searchTerm) next.set("q", searchTerm);
    const community = searchParams.get("community");
    if (community) next.set("community", community);
    searchParams.getAll("tag").forEach((tag) => next.append("tag", tag));
    navigate(`/search?${next.toString()}`);
  }

  return (
    <header className="hero">
      <img src="/img/hero.jpg" className="hero-img" alt="" onClick={() => navigate("/home")} />
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title" onClick={() => navigate("/home")}>
            <img src="/img/ravendb-logo.svg" className="hero-logo" alt="RavenDB" />
            Hugin
          </h1>
          <h2>Offline knowledge base</h2>
          <div className="search-input-container">
            <input
              type="search"
              className="search-input"
              placeholder="Search database"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyUp={(event) => event.key === "Enter" && navigateToSearch()}
            />
            <button className="search-btn" type="button" onClick={navigateToSearch}>
              Search
            </button>
          </div>
          <AiSearchToggle />
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
