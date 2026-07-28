/* eslint-disable react/prop-types */
import "../styles/components/search-skeleton.css";

export default function SearchSkeleton({ mode = "fts" }) {
  return (
    <div className="search-skeleton" role="status" aria-live="polite">
      <strong>{mode === "ai" ? "Refining with AI…" : "Searching…"}</strong>
      {[0, 1, 2, 3].map((row) => (
        <div className="search-skeleton-row" key={row}>
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
