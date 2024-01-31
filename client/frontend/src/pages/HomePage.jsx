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
                    Hugin is an offline knowledge base appliance, meant to allow you
                    to keep your knowledge accessible to you, even when on the go and
                    without connectivity.
                  </p>
                  <p>
                    The Hugin appliance allows you to keep a searchable index of key
                    Stack Exchange sites, in a form factor that can fit a key chain.
                    The appliance is self contained and requires no maintenance or
                    overhead.
                  </p>
                  <p>
                    Hugin comes by default with the following data sets (and you can
                    add more yourself):
                  </p>
                  <div className="vstack gap-2 my-4">
                    <div className="tech-link bg-faded-raspberrypi py-2 px-4 rounded-5 hstack gap-3 align-items-center">
                      <img src="/img/raspberrypi.svg" alt="raspberry-pi" />
                      <div className="lead">raspberrypi.stackexchange.com</div>
                    </div>
                    <div className="tech-link bg-faded-unix py-2 px-4 rounded-5 hstack gap-3 align-items-center">
                      <img src="/img/unix.svg" alt="linux" />
                      <div className="lead">unix.stackexchange.com</div>
                    </div>
                    <div className="tech-link bg-faded-serverfault py-2 px-4 rounded-5 hstack gap-3 align-items-center">
                      <img src="/img/serverfault.svg" alt="server" />
                      <div className="lead">serverfault.com</div>
                    </div>
                    <div className="tech-link bg-faded-unix py-2 px-4 rounded-5 hstack gap-3 align-items-center">
                      <img src="/img/superuser.svg" alt="superuser" />
                      <div className="lead">superuser.com</div>
                    </div>
                  </div>
                  <p>
                    Hugin is typically deployed on a Raspberry Pi Zero 2 W (but is
                    compatbile with any Raspberry Pi release in the last decade or
                    so). If you are reading this text, you are probably looking at the
                    device right now.
                  </p>

                  <h3 className="mt-5 mb-3">Why build Hugin?</h3>
                  <p>
                    We want to show case wide range of capabilities for RavenDB. From
                    the backend database for cloud business applications all the way
                    down to running on a keychain size computer without any
                    connectivity.
                  </p>
                  <p>
                    We also want to do something that would be <em>useful</em> on its
                    on. Yet Another Sample App gets boring after a while, after all.
                    The idea is that Hugin gives you something meaningful. Plug it
                    into power, connect to it and you have offline repository of
                    knowledge that would be <em>very</em> useful for a lot of people.
                  </p>
                  <p>
                    RavenDB is also very well suited for running in both disconnected
                    and partially connected environments and has a set of features
                    aimed specifically for running on the edge.
                  </p>
                  <p>
                    We hope that you&apos;ll find it useful, and would appreciate any
                    feedback or comments you have.
                  </p>

                  <h3 className="mt-5 mb-3">Why did we put RavenDB on a Raspberry?</h3>
                  <p>
                    In short, because we can! Because it is cool! And because it is
                    fun!
                  </p>
                  <p>
                    RavenDB can run on the Raspberry Pi, it is actually an important
                    use case for us when it comes to deploying RavenDB as part of
                    Internet of Things systems. The platfrom is perfect for when you
                    need to deploy a database on the edge, and we have a lot of users
                    who are doing just that.
                  </p>
                  <p>
                    We also wanted to show case how RavenDB can run on a very small
                    device, specifically to show how efficient it is in running with
                    very few resources. You can see how fast this application is,
                    while RavenDB is running on a device that is likely less powerful
                    than your watch. In the same vien, RavenDB can deliver low
                    latency, high availability and high throughput for your systems.
                    Most importantly, it can do that while encapsulating a lot of the
                    complexity of building such as system.
                  </p>
                  <p>
                    Hugin is open source (as is RavenDB, for that matter). If
                    you&apos;ll browse Hugin&apos;s source code, (which we highly
                    encourage), you&apos;ll that there isn&apos;t anything fancy going
                    on there. It is a pretty standard React application, using node.js
                    server in the backend to talk to RavenDB. The key here is that we
                    are working with the most vanilla setup possible, and we are still
                    getting a lot of value from RavenDB.
                  </p>
                  <p>
                    RavenDB is managing gigabytes on information, running on a
                    constrained device with about 512MB of RAM and with an SD Card as
                    storage, which is very slow device. To a very large extent, we
                    stacked the cards against us being able to deliver a good user
                    experience and a snappy application. It is doing so while
                    providing a very responsive user experience.
                  </p>
                  <p>
                    The default configuration of Hugin includes 4.2 million documents and
                    over 2.6 million questions and answers. The data size is a bit higher
                    than 5GB in size.
                  </p>
                  <p>
                    Hugin is typically deployed on a Raspberry Pi Zero 2 W (but is
                    compatbile with any Raspberry Pi release in the last decade or
                    so). If you are reading this text, you are probably looking at the
                    device right now.
                  </p>
                  <p>That means that we are working with a dataset that is 10 times
                    larger than memory and using an SD card for storage (<em>very</em> slow).
                    And yet, the application is very responsive and fast. This is because
                    we built RavenDB to make efficient use of resources and to be able to
                    deliver high performance even in constrained environments.
                  </p>
                  <p>Conversely, you can give RavenDB more resources and see it deliver
                    top of the line performance and throughput at any load.
                  </p>

                  <h3>The data set</h3>
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
