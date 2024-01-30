import { httpService } from "../services/http.service";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import BackendTiming from "../components/BackendTiming";

function How() {
    const [serverResult, setServerResult] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        httpService.get("indexes")
            .then((res) => { setServerResult(res); })
            .catch((err) => { alert("Failed to read indexes: " + err); });
    }, [dispatch]);
    return (
        <main className="home-page">

            <div className="info-container">
                <div className="info-col left-col">
                    <div className="card info-card hugin-description">
                        <div className="hugin-description-title">
                            <img src="/img/raven.svg" width="50px" alt="" />
                            <h2 className="m-0">All about Hugin</h2>
                        </div>
                        <p className="lead">Hugin is an appliance, meant to provide you with the ability
                            to browse through the Stack Exchange data in an offline manner. In this page
                            we'll take a deep dive into exactly it is built</p>
                        <p>It is built using the following technologies:</p>
                        <ul>
                            <li><strong>Hardware:</strong> Raspberry Pi Zero 2 W (but any Raspberry Pi
                                with a WiFi connection will do</li>
                            <li><strong>Operating System:</strong> Raspberry Pi OS Lite (32 Bits, Bullseye)</li>
                            <li><strong>Database:</strong> RavenDB 6.0</li>
                            <li><strong>Programming Language:</strong> JavaScript (node.js, Express, React)</li>
                        </ul>
                        <h3>The datasets:</h3>
                        <p>
                            Hugin comes by default with the following data sets:
                        </p>
                        <div className="tech-link">
                            <img src="/img/raspberrypi.svg" alt="raspberry-pi" />
                            <p>Raspberry Pi Stack Exchange</p>
                        </div>
                        <div className="tech-link">
                            <img src="/img/unix.svg" alt="linux" />
                            <p>Unix & Linux  Stack Exchange</p>
                        </div>
                        <div className="tech-link">
                            <img src="/img/serverfault.svg" alt="serverfault" />
                            <p>Server Fault</p>
                        </div>
                        <div className="tech-link">
                            <img src="/img/superuser.svg" alt="superuser" />
                            <p>Super User</p>
                        </div>
                        <p>In total, the dataset contains 4.3M docuemnts and
                            over 2.6 million questions and answers and consumes
                            4GB of disk space. This is possible because
                            RavenDB used documents compression, without which the
                            data size is 9GB. RavenDB's documents compression feature was
                            able to reduce the disk space used by over 50%!</p>
                        <p>Given that we are running on a Raspberry Pi and that the underlying
                            disk used is a (slow) SD card, reducing the amount of I/O read is
                            very important. It also ensures that we can run with a pretty significant
                            dataset on a small SD card.
                        </p>

                        <h3>Querying</h3>
                        <p>
                            RavenDB uses indexes to speed up queries. In this case, we defined two
                            indexes manually. The <code>QuestionsSearch</code> and
                            <code>QuestionsTags</code> indexes. These allow us to search for questions
                            in an efficent manner as well as show statistics on tags distributions.
                        </p>
                        <p>Those indexes are defined as part of the backend code and you can inspect
                            what is going on with them by pressing the following button.
                        </p>
                        <BackendTiming code={serverResult.indexes.map(x => x.code).join("\n\n\n")} />

                        <h3>How we got the data?</h3>
                    </div>
                </div>

                <div className="info-col right-col">

                    <div className="card">
                        <h3>💡Tip: Read the code</h3>
                        <p>
                            <p>Most pages has this code icon that you can click:</p>
                            <img src="/img/code.svg" alt="Code Marker" width={50} />
                            <p>That will open the backend code for that particular page so you can inspect in details
                                how we actually wrote the code for this application.</p>
                        </p>
                    </div>
                    <div className="card">
                        <img
                            src="/img/raven.svg"
                            alt="RavenDB's Logo"
                            className="raven-icon"
                        />
                        <h3>Learn more about RavenDB</h3>
                        <ul>
                            <li>
                                <a href="https://ravendb.net/?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">
                                    RavenDB Home Page
                                </a>
                            </li>
                            <li>
                                <a href="https://ravendb.net/try?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">
                                    RavenDB Try
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/ravendb/ravendb/discussions?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">
                                    Github Discussions
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/ravendb/hugin/?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">
                                    Hugin's GitHub page
                                </a>
                            </li>
                        </ul>
                        <p>
                            <em>Note:</em> you may need to disconnect from Hugin's WiFi
                            and connect to the normal network to access those links. By
                            default Hugin's WiFi is not connected to the Internet.
                        </p>
                    </div>
                </div>
            </div>

        </main>
    )
}

export default How