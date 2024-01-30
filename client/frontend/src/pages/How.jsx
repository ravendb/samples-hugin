import { httpService } from "../services/http.service";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import CodeModal from "../components/CodeModal";

function How() {
    const [serverResult, setServerResult] = useState({ indexes: [] });
    const dispatch = useDispatch();
    const [codeToShow, setCodeToShow] = useState('');


    useEffect(() => {
        httpService.get("indexes")
            .then((res) => { setServerResult(res); })
            .catch((err) => { alert("Failed to read indexes: " + err); });
    }, [dispatch]);
    return (
        <main className="home-page">

            <div className="info-container container my-6">
                <div className="row">
                    <div className="col-lg-8">
                        <div className="info-col left-col">
                            <div className="card info-card">
                                <div className="card-body hugin-description">
                                    <div className="hugin-description-title">
                                        <img src="/img/raven.svg" alt="" />
                                        <h2 className="m-0">All about Hugin...</h2>
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
                                        <li><strong>Disk: </strong> 32 GB micro SD card</li>
                                    </ul>
                                    <h3>The datasets:</h3>
                                    <p>
                                        Hugin comes by default with the following data sets:
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
                                    <p>In total, the dataset contains <em>4.3 million documents</em> and
                                        over <em>2.6 million questions and answers</em> and consumes
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
                                        RavenDB uses indexes to speed up queries. These allow us to search for questions
                                        in an efficent manner as well as show statistics on tags distributions.
                                        The following indexes are defined:
                                        {codeToShow ? (<CodeModal code={codeToShow} onClose={() => setCodeToShow(null)} />) : (<></>)}
                                        <ul>
                                            {serverResult.indexes.map(i => (
                                                <li>
                                                    <button className="backend-timing-btn mt-3" onClick={() => { setCodeToShow(i.code); }}>
                                                        <img src={`/img/code.svg`} className="backend-timing-btn-img" /> <code>{i.name}</code>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>

                                    </p>
                                    <p>Those indexes are defined as part of the backend code and you can click on their buttons above
                                        to see the definition. RavenDB indexes allows you to shift the work from the query time to indexing
                                        time and allows us to create a very fast experience for the user. Even when running on a very low
                                        end machine (or a cloud instance).
                                    </p>

                                    <h3>How we got the data?</h3>
                                    <p>
                                        The data we are using for this project was taken from the
                                        <a href="https://archive.org/details/stackexchange">Stack Exchange Data Dump</a> on archive.org.
                                        We took the data sets from the sites focused on administration and devops, so we could generate a dataset
                                        to be used offline that would be <em>useful</em> for actual in-field work.
                                    </p>
                                    <p>You can add your own communities to the dataset, visit the archive.org <a href="https://archive.org/details/stackexchange">Stack Exchange
                                        Data Dump</a> and download the data sets you want. Then, you can use the following <a href="https://gist.github.com/ayende/50cd2f071547016a635adf21292fd0bc">code snippet</a> to import the
                                        data into RavenDB. You'll also need to provide an <code>svg</code> icon file for the community, to get
                                        the UI to display it properly.
                                    </p>
                                    <h4>Can I get an offline Stack Overflow?</h4>
                                    <p>
                                        The Stack Overflow data dump is <em>huge</em>. Even with compression, it is over 50GB in size (and without
                                        compression) it is much bigger. You'll need to either connect an additional disk to the Raspberry Pi or use a
                                        bigger micro SD card to manage that.
                                    </p>
                                    <p>
                                        Note that the primary limitation here is the amount of disk space that you have. RavenDB can handle that much
                                        data without any issues, even on a machine as small as the Raspberry Pi Zero 2 W.
                                    </p>
                                    <p>
                                        The Stack Overflow data dump is distributed using multiple files, so you'll need to update the
                                        <a href="https://gist.github.com/ayende/50cd2f071547016a635adf21292fd0bc">code snippet</a> to handle that (instead
                                        of assuming all the files are in the same archive file). But aside from that, it works just fine.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="info-col right-col">

                            <div className="card bg-faded-primary">
                                <div className="card-body ">
                                    <h3>💡Tip: Read the code</h3>
                                    <p>
                                        <p>Most pages has this code icon that you can click:</p>
                                        <img src="/img/code.svg" alt="Code Marker" width={50} />
                                        <p>That will open the backend code for that particular page so you can inspect in details
                                            how we actually wrote the code for this application.</p>
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-faded-primary">
                                <div className="card-body ">
                                    <h3>💡Tip: Check the time</h3>
                                    <ul className="backend-timing-list">
                                        {Object.entries(serverResult.timings || {}).map(([key, value]) => (
                                            <li key={key} className="backend-timing-list-item">
                                                <strong>
                                                    <img src={"/img/" + key + ".svg"} className="timing-icon" />
                                                    {key}
                                                </strong>
                                                <span>
                                                    {value.toLocaleString(undefined, {
                                                        maximumFractionDigits: 2,
                                                    })}{" "}
                                                    ms
                                                    <img src={`/img/stopwatch.svg`} className="stopwatch-icon" />
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p>
                                        RavenDB is really fast, even on small devices like the Raspberry Pi Zero 2 W.
                                        We show you exactly how long it took to run the query on each and every page.
                                    </p>
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

        </main >
    )
}

export default How