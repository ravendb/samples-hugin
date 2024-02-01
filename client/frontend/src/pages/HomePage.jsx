import { useNavigate } from "react-router-dom";
import { getCommunities } from "../services/data.service";
import "../styles/pages/home-page.css";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import BackendTiming from "../components/BackendTiming";
import DatabaseLink from "../components/DatabaseLink";
import { getRedirectLink } from "../services/util.service";

function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [serverResult, setCommunities] = useState([]);

  useEffect(() => {
    async function fetchCommunities() {
      const res = await getCommunities();

      setCommunities(res);
    }

    fetchCommunities();
  }, [dispatch]);

  function communityClick(community) {
    navigate(`/search?community=${community}`);
  }

  return (
    <main className="home-page">
      {serverResult.data && (
        <div className="cards">
          {serverResult.data.map((c) => (
            <div
              className="card tag-card"
              onClick={() => communityClick(c.Community)}
              key={c.Name}
            >
              <div className="card-content">
                <img
                  src={`/img/${c.Community}.svg`}
                  alt={c.Description}
                  className="card-img"
                />
                <div>
                  <h3 className="mb-1">{c.Name}</h3>
                  <p className="m-0">{c.Description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="info-container container my-6">
        <div className="row">
          <div className="col-lg-8">
            <div className="info-col left-col">
              <div className="card info-card">
                <div className="card-body hugin-description">
                  <div className="hugin-description-title">
                    <img src="/img/raven.svg" alt="" />
                    <h2 className="m-0">What is Hugin?</h2>
                  </div>
                  <p className="lead">
                    Hugin is an offline knowledge base appliance, which is seeded with several
                    <a href="https://stackexchange.com/">Stack Exchange</a> communities to allow
                    you to access them even when you are offline. These communities were curated
                    to be useful for devops scenarios when you don't have access to the internet.
                  </p>
                  <div className="vstack gap-2 my-4">
                    <div className="tech-link bg-faded-raspberrypi py-2 px-4 rounded-5 hstack gap-3 align-items-center">
                      <img src="/img/raspberrypi.svg" alt="raspberry-pi" />
                      <div className="lead"><a href="https://raspberrypi.stackexchange.com" target="_blank">raspberrypi.stackexchange.com</a></div>
                    </div>
                    <div className="tech-link bg-faded-unix py-2 px-4 rounded-5 hstack gap-3 align-items-center">
                      <img src="/img/unix.svg" alt="linux" />
                      <div className="lead"><a href="https://unix.stackexchange.com" target="_blank">unix.stackexchange.com</a></div>
                    </div>
                    <div className="tech-link bg-faded-serverfault py-2 px-4 rounded-5 hstack gap-3 align-items-center">
                      <img src="/img/serverfault.svg" alt="server" />
                      <div className="lead"><a href="https://serverfault.com" target="_blank">serverfault.com</a></div>
                    </div>
                    <div className="tech-link bg-faded-unix py-2 px-4 rounded-5 hstack gap-3 align-items-center">
                      <img src="/img/superuser.svg" alt="superuser" />
                      <div className="lead"><a href="https://superuser.com" target="_blank">superuser.com</a></div>
                    </div>
                  </div>


                  <h3 className="mt-5 mb-3">Why build Hugin?</h3>
                  <p>
                    RavenDB is also very well suited for running in both disconnected
                    and partially connected environments and has a set of features
                    aimed specifically for running on the edge. We wanted to provide you
                    with a useful demonstration of how RavenDB can be used in such a scenario.
                  </p>
                  <p>
                    Hugin is running on a Raspberry Pi Zero 2 W appliance which hosts a
                    RavenDB database and a node.js React application to provide a completely
                    offline exprience. The appliance is loaded with several Stack Exchange
                    communities with over 2.6 million questions and answers.
                  </p>
                  <p>Even though Hugin is running on low end hardware (just 512MB of RAM) it
                    holds up very well and is able to run complex queries in a matter of milliseconds.
                    That is with a dataset that is over ten times bigger than the amount of memory it holds.
                    We want to make you <em>feel</em> just how fast and efficient RavenDB is.
                  </p>

                  <h3>Learn more...</h3>
                  <p>
                    You can read more about how Hugin works in the
                    <a href="/how">How Hugin Works</a> page.
                  </p>
                </div>
              </div>

            </div>
          </div>
          <div className="col-lg-4">
            <div className="info-col right-col">
              <BackendTiming timings={serverResult.timings} code={serverResult.code} />
              <DatabaseLink />

              <div className="card bg-faded-primary">
                <div className="card-body ">
                  <h3>How this works?</h3>
                  <p>
                    You can read more about how Hugin works in the
                    <a href="/how">How Hugin Works</a> page.
                  </p>
                  <p>
                    The elevator pitch is that it is a Raspberry Pi Zero 2 W appliance
                    running RavenDB and a node.js React application to provide a
                    completely offline access to StackExchange communities&apos;
                    questions and answers.
                  </p>
                  <div className="text-center">
                    <img src="/img/ravendb-logo.svg" alt="RavenDB Logo" width="61%" className="mt-2" />
                  </div>
                </div>
              </div>
              <div className="card bg-faded-warning">
                <div className="card-body bg-faded-primary rounded-2">
                  <img
                    src="/img/raven.svg"
                    alt="RavenDB's Logo"
                    className="raven-icon"
                  />
                  <h3>Learn more about RavenDB</h3>
                  <ul>
                    <li>
                      <a target="_blank" href={getRedirectLink("https://ravendb.net/?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin")}>
                        RavenDB Home Page
                      </a>
                    </li>
                    <li>
                      <a target="_blank" href={getRedirectLink("https://ravendb.net/try?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin")}>
                        RavenDB Try
                      </a>
                    </li>
                    <li>
                      <a target="_blank" href={getRedirectLink("https://github.com/ravendb/ravendb/discussions?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin")}>
                        Github Discussions
                      </a>
                    </li>
                    <li>
                      <a target="_blank" href={getRedirectLink("https://github.com/ravendb/hugin/?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin")}>
                        Hugin&apos;s GitHub page
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="card-body">

                  <em>Note:</em> you may need to disconnect from Hugin&apos;s WiFi
                  and connect to the normal network to access those links. By
                  default Hugin&apos;s WiFi is not connected to the Internet.

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
