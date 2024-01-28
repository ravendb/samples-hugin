/* eslint-disable react/prop-types */
import { useState } from "react";
import "../styles/components/backend-timing.css";
import CodeModal from "./CodeModal";

function BackendTiming({ serverResult }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleToggleModalBtn() {
    setIsModalOpen(!isModalOpen);
  }

  function onClose() {
    setIsModalOpen(false);
  }

  return (
    <div className="card backend-timing">
      <h2 className="backend-timing-title">Backend timings:</h2>
      <ul className="backend-timing-list">
        {Object.entries(serverResult.timings || {}).map(([key, value]) => (
          <li key={key} className="backend-timing-list-item">
            <strong>{key}</strong> -{" "}
            {value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{" "}
            ms
          </li>
        ))}
      </ul>
      <button className="backend-timing-btn" onClick={handleToggleModalBtn}>
        <img src={`/img/code.svg`} className="backend-timing-btn-img" />
        <span className="backend-timing-btn-text">
          Click here to see how the backend works.
        </span>
      </button>
      {isModalOpen && <CodeModal code={serverResult.code} onClose={onClose} />}
    </div>
  );
}

export default BackendTiming;
