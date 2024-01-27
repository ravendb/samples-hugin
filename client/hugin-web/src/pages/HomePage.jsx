import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpService } from "../services/http.service";

function HomePage() {
    const navigtate = useNavigate();
    const [cards, setCards] = useState([]);

    function handleLinkClick(url) {
        navigtate(url);
    }

    useEffect(() => {
        async function fetchCards() {
            const res = await httpService.get("cards")
            setCards(res.data);
        }

        fetchCards();
    }, []);

    return (
        <main className="home-page">


            <div className="hero">
                <img src="/img/hero.jpg" className="hero-img" alt="" />
                <div className="hero-container">
                    <div className="hero-content">
                        <h1>
                            <img src="/img/ravendb-logo.svg" className="ravendb-logo" alt="RavenDB" />'s
                            Hugin
                        </h1>
                        <h3>Offline knowledge base appliance</h3>
                        <div className="hero-input input-group input-group-lg">
                            <input type="text" className="form-control px-4 py-2" placeholder="Search database" />
                            <button className="btn btn-primary px-4" type="button" id="">Search</button>
                        </div>
                    </div>

                </div>
            </div>

            <div class="container mt-5">
                <div className="hero-cards">
                    {cards.map((card) => (
                        <div className="card bg-faded-primary" style={{ cursor: "pointer" }} onClick={() => handleLinkClick(card.link)}>
                            <div className="px-4 py-3 hstack gap-4 align-items-start">
                                <img src={`/img/${card.image}`} alt={card.alt} className="hero-cards-img" />
                                <div>
                                    <h3 className="m-0">{card.name}</h3>
                                    <p>{card.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div class="row mt-4">
                    <div class="col-md-8 mb-3">
                        <div class="card p-5">
                            <div class="hstack gap-4 align-items-center mb-4">
                                <img src="/img/raven.svg" width="50px" alt="" />
                                <h2 class="m-0">What is Hugin?</h2>
                            </div>
                            <p class="lead">Hugin is an offline knowledge base appliance, meant to allow you to
                                keep your knowledge accessible to you, even when on the go and without connectivity.</p>
                            <p>The Hugin appliance allows you to keep a searchable index of key Stack Exchange sites,
                                in a form factor that can fit a key chain. The appliance is self contained and requires no
                                maintenance or overhead.
                            </p>
                            <p>Hugin comes by default with the following data sets (and you can add more yourself):</p>
                            <p><img src="/img/raspberry-pi.svg" width="50px" alt="" />raspberrypi.stackexchange.com</p>
                            <p><img src="/img/linux.svg" width="50px" alt="" />unix.stackexchange.com</p>
                            <p><img src="/img/server.svg" width="50px" alt="" />serverfault.com</p>
                            <p>Hugin is typically deployed on a Raspberry Pi Zero 2 W (but is compatbile with any Raspberry Pi release
                                in the last decade or so). If you are reading this text, you are probably looking at the device right now.
                            </p>


                            <h3>Why build Hugin?</h3>
                            <p>We want to show case wide range of capabilities for RavenDB. From the backend database
                                for cloud business applications all the way down to running on a keychain size computer
                                without any connectivity.
                            </p>
                            <p>We also want to do something that would be <em>useful</em> on its on. Yet Another Sample App
                                gets boring after a while, after all. The idea is that Hugin gives you something meaningful.
                                Plug it into power, connect to it and you have offline repository of knowledge that would be
                                <em>very</em> useful for a lot of people.
                            </p>
                            <p>RavenDB is also very well suited for running in both disconnected and partially connected environments
                                and has a set of features aimed specifically for running on the edge.
                            </p>
                            <p>We hope that you'll find it useful, and would appreciate any feedback or comments you have.
                            </p>

                            <h3>Why did we put RavenDB on a Raspberry?</h3>
                            <p>In short, because we can! Because it is cool! And because it is fun!</p>
                            <p>
                                RavenDB can run on the Raspberry Pi, it is actually an important use case for us when it comes to
                                deploying RavenDB as part of Internet of Things systems. The platfrom is perfect for when you need to
                                deploy a database on the edge, and we have a lot of users who are doing just that.
                            </p>
                            <p>
                                We also wanted to show case how RavenDB can run on a very small device, specifically to show how
                                efficient it is in running with very few resources. You can see how fast this application is,
                                while RavenDB is running on a device that is likely less powerful than your watch.
                                In the same vien, RavenDB can deliver low latency, high availability and high throughput for your systems.
                                Most importantly, it can do that while encapsulating a lot of the complexity of building such as system.
                            </p>
                            <p>
                                Hugin is open source (as is RavenDB, for that matter). If you'll browse Hugin's source code, (which we
                                highly encourage), you'll that there isn't anything fancy going on there. It is a pretty standard React
                                application, using node.js server in the backend to talk to RavenDB. The key here is that we are working with
                                the most vanilla setup possible, and we are still getting a lot of value from RavenDB.
                            </p>
                            <p>RavenDB is managing gigabytes on information, running on a constrained device with about 512MB of RAM and with
                                an SD Card as storage, which is very slow device. To a very large extent, we stacked the cards against us being
                                able to deliver a good user experience and a snappy application. It is doing so while providing a very
                                responsive user experience.
                            </p>
                            <p>You can read more about how Hugin works in the <a href="/how">How Hugin Works</a> page.</p>
                        </div>
                    </div>

                    <div class="col-md-4 mb-3">
                        <div class="card p-3 mb-3">
                            <h3>How this works?</h3>
                            <p>You can read more about how Hugin works in the <a href="/how">How Hugin Works</a> page.</p>
                            <p>The elevator pitch is that it is a Raspberry Pi Zero 2 W appliance running RavenDB
                                and a node.js React application to provide a completely offline access to StackExchange
                                communities' questions and answers.</p>
                            <img src="/img/ravendb-logo.svg" alt="RavenDB's Logo" />
                        </div>
                        <div class="card p-3 mb-3">
                            <img src="/img/raven.svg" alt="RavenDB's Logo" width={50} />
                            <h3>Learn more about RavenDB</h3>
                            <ul>
                                <li><a href="https://ravendb.net/?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">RavenDB Home Page</a></li>
                                <li><a href="https://ravendb.net/try?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">RavenDB Try</a></li>
                                <li><a href="https://github.com/ravendb/ravendb/discussions?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">Github Discussions</a></li>
                                <li><a href="https://github.com/ravendb/hugin/?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">Hugin's GitHub page</a></li>
                            </ul>
                            <p><em>Note:</em> you may need to disconnect from Hugin's WiFi and connect to the normal network
                                to access those links. By default Hugin's WiFi is not connected to the Internet.
                            </p>

                        </div>
                    </div>
                </div>


            </div>
        </main >
    );
}

export default HomePage;