import { useNavigate } from "react-router-dom";
import { getCommunities } from "../services/data.service";
import "../styles/pages/home-page.css";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import BackendTiming from "../components/BackendTiming";
import DatabaseLink from "../components/DatabaseLink";
import { ExternalLink } from "../components/ExternalLink";

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

      <div className="info-container container my-3">
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="info-col left-col">
              <div className="card info-card">
                <div className="card-body hugin-description">
                  <div className="hugin-description-title">
                    <img src="/img/raven.svg" alt="" />
                    <h2 className="m-0">What is Hugin?</h2>
                  </div>
                  <p className="lead">
                    Hugin is an offline knowledge base appliance seeded with several <ExternalLink href="https://stackexchange.com/">Stack Exchange</ExternalLink> communities, enabling you to browse and search them even when you are offline. These communities were curated to be useful primarily for DevOps scenarios. If you find yourself in a situation where you need to debug a problem without internet access, Hugin can help you find the answer you need.
                  </p>
                  <div className="vstack gap-2 my-4">
                    <div className="tech-link bg-faded-raspberrypi py-2 px-4 rounded-5 hstack gap-3 align-items-center">
                      <img src="/img/raspberrypi.svg" alt="raspberry-pi" />
                      <div className="lead"><ExternalLink href="https://raspberrypi.stackexchange.com">raspberrypi.stackexchange.com</ExternalLink></div>
                    </div>
                    <div className="tech-link bg-faded-unix py-2 px-4 rounded-5 hstack gap-3 align-items-center">
                      <img src="/img/unix.svg" alt="linux" />
                      <div className="lead"><ExternalLink href="https://unix.stackexchange.com" >unix.stackexchange.com</ExternalLink></div>
                    </div>
                    <div className="tech-link bg-faded-serverfault py-2 px-4 rounded-5 hstack gap-3 align-items-center">
                      <img src="/img/serverfault.svg" alt="server" />
                      <div className="lead"><ExternalLink href="https://serverfault.com" >serverfault.com</ExternalLink></div>
                    </div>
                    <div className="tech-link bg-faded-superuser py-2 px-4 rounded-5 hstack gap-3 align-items-center">
                      <img src="/img/superuser.svg" alt="superuser" />
                      <div className="lead"><ExternalLink href="https://superuser.com" >superuser.com</ExternalLink></div>
                    </div>
                  </div>

                  <h3 className="mt-5 mb-3">Why build Hugin?</h3>
                  <p>
                    RavenDB is well-suited for running in both disconnected and partially connected environments, offering a set of features specifically designed for edge computing. We wanted to provide you with a live demonstration of how RavenDB can be effectively utilized in disconnected scenarios.
                  </p>
                  <p>
                    Hugin is running on a Raspberry Pi Zero 2 W appliance, hosting a RavenDB database and a node.js React application, providing a complete offline exprience. The appliance is loaded with several Stack Exchange communities containing over 2.6 million Q&As.
                  </p>
                  <p>
                    Even though Hugin is running on low-end hardware, with a 1GHz CPU and just 512MB of RAM, it performs remarkably well. It's capable of running complex queries in a matter of milliseconds, while managing a dataset ten times larger than its available memory. We want to allow you to <em>experience</em> just how fast and efficient RavenDB is.
                  </p>
                  <h3>Learn more...</h3>
                  <p>
                    You can read more about how Hugin works in the <ExternalLink className="btn btn-dark" href="/how">How Hugin Works</ExternalLink> page.
                  </p>
                  <h4>Doing more with Hugin</h4>
                  <p>
                    The device you are holding is running Linux and is accessible via SSH with the following credentials: <code>rdb</code> / <code>awesome</code> while connected to the <code>Hugin (ravendb)</code> network.
                  </p>
                  <p>
                    You'll find the source code for Hugin on the device (<code>/usr/lib/hugin</code>) or on <ExternalLink href="https://github.com/ravendb/samples-hugin">github.com/ravendb/samples-hugin</ExternalLink>.
                  </p>
                </div>
              </div>

            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="info-col right-col">
              <BackendTiming timings={serverResult.timings} code={serverResult.code} />
              <DatabaseLink />

              <div className="card bg-faded-primary">
                <div className="card-body text-light">
                  <h3>How this works?</h3>
                  <p>
                    You can read more about how Hugin works in the <a href="/how">How Hugin Works</a> page.
                  </p>
                  <p>
                    The elevator pitch is that Hugin is a Raspberry Pi Zero 2 W appliance running RavenDB and a node.js React application, providing complete offline access to StackExchange communities&apos; questions and answers.
                  </p>
                  <div className="text-center">
                    <img src="/img/ravendb-logo.svg" alt="RavenDB Logo" width="61%" className="mt-2" />
                  </div>
                </div>
              </div>
              <div className="card bg-faded-warning">
                <div className="card-body bg-faded-primary rounded-2">
                  <div className="hstack align-items-center gap-3 mb-3">
                    <img
                      src="/img/raven.svg"
                      alt="RavenDB's Logo"
                      className="raven-icon"
                    />
                    <h3 className="m-0">Learn more about RavenDB</h3>
                  </div>
                  <ul>
                    <li>
                      <ExternalLink href="https://ravendb.net/?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">RavenDB Home Page</ExternalLink>
                    </li>
                    <li>
                      <ExternalLink href="https://ravendb.net/try?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">
                        RavenDB Try
                      </ExternalLink>
                    </li>
                    <li>
                      <ExternalLink href="https://github.com/ravendb/ravendb/discussions?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin" >
                        GitHub Discussions
                      </ExternalLink>
                    </li>
                    <li>
                      <ExternalLink href="https://github.com/ravendb/samples-hugin?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">
                        Hugin&apos;s GitHub page
                      </ExternalLink>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <em>Note:</em> you may need to disconnect from Hugin&apos;s WiFi and connect to the regular network to access those links. By default Hugin&apos;s WiFi is not connected to the Internet.
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
