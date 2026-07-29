import "../styles/components/search-controller.css";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getServerResult, setViewMode } from "../store/store";

export default function SearchController() {
  const [params, setParams] = useSearchParams();
  const dispatch = useDispatch();
  const { searchResult } = getServerResult();
  const showAi = searchResult.aiEnabled &&
    (searchResult.refining || searchResult.ai);

  return (
    <div className="search-header">
      <div className="search-header-filters">
        {params.getAll("community").map((value) => (
          <button key={value} onClick={() => setParams((next) => {
            next.delete("community", value);
            return next;
          })}>{value} ×</button>
        ))}
        {params.getAll("tag").map((value) => (
          <button key={value} onClick={() => setParams((next) => {
            next.delete("tag", value);
            return next;
          })}>{value} ×</button>
        ))}
      </div>
      <label>
        Sort{" "}
        <select
          value={params.get("orderBy") || "CreationDate"}
          onChange={(event) => setParams((next) => {
            next.set("orderBy", event.target.value);
            return next;
          })}
        >
          <option value="CreationDate">Newest</option>
          <option value="Score">Score</option>
          <option value="ViewCount">Views</option>
        </select>
      </label>
      {showAi && (
        <div className="search-mode" role="group" aria-label="Search result mode">
          <button
            className={searchResult.viewMode === "normal" ? "active" : ""}
            onClick={() => dispatch(setViewMode("normal"))}
          >Full text</button>
          <button
            className={searchResult.viewMode === "ai" ? "active" : ""}
            onClick={() => dispatch(setViewMode("ai"))}
          >
            AI {searchResult.aiPhase === "running" && !searchResult.ai ? "…" : ""}
          </button>
        </div>
      )}
    </div>
  );
}
