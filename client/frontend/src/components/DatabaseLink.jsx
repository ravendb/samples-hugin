/* eslint-disable react/prop-types */
import { useState } from "react";

function DatabaseLink({ }) {
  const useNamedHosts = window.location.hostname == "start.ravendb";
  const dbHost = useNamedHosts ? "http://database.ravendb" : "http://" + window.location.hostname + ":8080";
  return (
    <div className="card database-link">
      <h2><a href={dbHost} target="_blank"> See the database</a></h2>
    </div>
  );
}

export default DatabaseLink;
