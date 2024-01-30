/* eslint-disable react/prop-types */
import { useState } from "react";

function DatabaseLink({ }) {
  const useNamedHosts = window.location.hostname == "start.ravendb";
  const dbHost = useNamedHosts ? "http://database.ravendb" : "http://" + window.location.hostname + ":8080";
  return (
    <div className="card bg-faded-primary database-link">
      <div className="card-body">
          <h2> 
            <a href={dbHost} target="_blank" className="stretched-link"> See the database</a>
          </h2>
          <img src={`/img/studio.png`} className="img-fluid" />
      </div>
    </div>
  );
}

export default DatabaseLink;
