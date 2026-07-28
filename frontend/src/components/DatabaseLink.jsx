function DatabaseLink() {
  const namedHost = window.location.hostname === "start.ravendb";
  const host = namedHost
    ? "http://database.ravendb"
    : `http://${window.location.hostname}:8080`;
  return (
    <div className="card bg-faded-primary database-link">
      <div className="card-body">
        <h2>
          <a href={host} target="_blank" rel="noreferrer" className="stretched-link">
            See the database
          </a>
        </h2>
        <img src="/img/studio.png" className="img-fluid" alt="RavenDB Studio" />
      </div>
    </div>
  );
}

export default DatabaseLink;
