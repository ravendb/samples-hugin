/* eslint-disable react/prop-types */
import { useState } from "react";
import "../styles/components/backend-timing.css";
import CodeModal from "./CodeModal";

const fmt = (value) => {
  if (typeof value !== "number") return "n/a";
  return value < 1000 ? `${value.toFixed(1)} ms` : `${(value / 1000).toFixed(2)} s`;
};

export default function BackendTiming({
  timings,
  code,
  result,
  mode = "fts",
  refining = false,
}) {
  const [showCode, setShowCode] = useState(false);
  const value = result?.timings || timings;
  const phases = value?.phases;
  const rows = phases ? [
    ["Queue", phases.queue_wait],
    ["Hugin setup", phases.session_open + phases.query_build],
    [mode === "ai" ? "Vector search" : "Full-text search", phases.query_exec],
    ["Related data", phases.parallel_fanout],
  ] : [];

  if (!value && !refining) return null;
  return (
    <article className="card backend-timing">
      <div className="card-body">
        <h3>{mode === "ai" ? "AI refinement" : "Full-text search"}</h3>
        {refining ? <p>Working…</p> : (
          <>
            <strong className="backend-timing-total">
              {fmt(phases?.total ?? value?.query)}
            </strong>
            <dl className="backend-timing-breakdown">
              {rows.map(([label, duration]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{fmt(duration)}</dd>
                </div>
              ))}
            </dl>
            {value?.fromCache && <small>Served from RavenDB client cache.</small>}
          </>
        )}
        {(result?.code || code) && (
          <button type="button" onClick={() => setShowCode(true)}>
            See backend route
          </button>
        )}
        {showCode && (
          <CodeModal code={result?.code || code} onClose={() => setShowCode(false)} />
        )}
      </div>
    </article>
  );
}
