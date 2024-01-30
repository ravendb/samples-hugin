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
    <div className="card bg-faded-primary backend-timing">
      <div className="card-body">
      <h3 className="backend-timing-title">Backend timings:</h3>
      <ul className="backend-timing-list">
        {Object.entries(serverResult.timings || {}).map(([key, value]) => (
          <li key={key} className="backend-timing-list-item">
            <strong>
              <img src={"/img/" + key +".svg"} className="timing-icon"/>
              {key}
            </strong>
            <span>
            {value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{" "}
            ms
            <img src={`/img/stopwatch.svg`} className="stopwatch-icon"/>
            </span>
          </li>
        ))}
      </ul>
      <button className="backend-timing-btn mt-3" onClick={handleToggleModalBtn}>
        <img src={`/img/code.svg`} className="backend-timing-btn-img" />
        <span className="backend-timing-btn-text">
          Click here to see how the backend works
        </span>
      </button>
      {isModalOpen && <CodeModal code={serverResult.code} onClose={onClose} />}
      </div>
    </div>
  );
}

export default BackendTiming;
