import { httpService } from "../services/http.service";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import CodeModal from "../components/CodeModal";
import { ExternalLink } from "../components/ExternalLink";

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

            <div className="info-container container my-3">
                <div className="row">
                    <div className="col-lg-8 mb-4">
                        <div className="info-col left-col">
                            <div className="card info-card">
                                <div className="card-body hugin-description">
                                    <div className="hugin-description-title">
                                        <img src="/img/raven.svg" alt="" />
                                        <h2 className="m-0">All about Hugin...</h2>
                                    </div>
                                    <p className="lead">Hugin is an appliance meant to provide you with the ability to browse through <ExternalLink href="https://stackexchange.com/">Stack Exchange</ExternalLink> communities in an offline manner. In this page we'll take a deep dive into its building blocks and how it works.</p>
                                    <p>Hugin is built using the following technologies:</p>
                                    <ul>
                                        <li><strong>Hardware:</strong> Raspberry Pi Zero 2 W (1Ghz quad-core, 512MB RAM) (any Raspberry Pi with WiFi will do)</li>
                                        <li><strong>Operating System:</strong> Raspberry Pi OS Lite (32 Bits, Bullseye)</li>
                                        <li><strong>Database:</strong> RavenDB 6.0</li>
                                        <li><strong>Programming Language:</strong> JavaScript (node.js, Express, React)</li>
                                        <li><strong>Disk: </strong> 32 GB micro SD card</li>
                                    </ul>

                                    <h3>Internal structure</h3>
                                    <p>Hugin is an appliance, it is running Linux OS and is meant to be completely plug & play. After you plug it to power, it will establish an open WiFi hotspot and setup a captive portal to direct connections to this website. You can read all about this in the <ExternalLink href="https://ayende.com/blog/200675-A/walkthrough-turning-a-raspberry-pi-into-an-appliance?key=601a5e9e8f8f47239a47d4d16a11faf9">following blog post</ExternalLink>.</p>
                                    <p>Inside the Pi, we are have the following key pieces:</p>
                                    <ul>
                                        <li><strong>RavenDB:</strong> an awesome database that can holds all the data and respond <em>quickly</em> to queries.</li>
                                        <li><strong>Nginx:</strong> responsible for routing requests and part of the captive portal setup.</li>
                                        <li><strong>Backend:</strong> written in node.js & express, processing the queries from this web application and talks to RavenDB directly.</li>
                                    </ul>
                                    <p>
                                        You can read the entire source code in <ExternalLink href="https://github.com/ravendb/samples-hugin/?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">Hugin&apos;s GitHub page</ExternalLink>.
                                    </p>
                                    <h3>Connecting to the appliance</h3>
                                    <p>
                                        The device you are holding is running Linux and is accessible via SSH with the following credentials: <code>rdb</code> / <code>awesome</code> while connected to the <code>Hugin (ravendb)</code> network.
                                    </p>
                                    <h3>Getting in touch with us:</h3>
                                    <p>We would love to hear from you, please visit our <ExternalLink href="https://github.com/ravendb/ravendb/discussions?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">Github discussions page</ExternalLink> if you have any questions or suggestions.
                                    </p>
                                    <h3>Default data sets</h3>
                                    <p>
                                        Hugin comes with pre-loaded with a few Stack Exchange communities. you can start using it immeidately. We chose to include the following communities: <code>raspberrypi.stackexchange.com</code>, <code>unix.stackexchange.com</code>, <code>serverfault.com</code>, and <code>superuser.com</code>. We selected those communities because they offer good coverage of devops topic and are very useful for offline scenarios.
                                    </p>
                                    <p>
                                        In total, the dataset contains <em>4.3 million documents</em> and over <em>2.6 million Q&As</em>. while it consumes just over 5GB of disk space. This is possible due to RavenDB useing documents compression. without it, the data size is about 11GB.
                                    </p>
                                    <p>
                                        RavenDB's documents compression feature is able to decrease the disk space used by over 50%. It also means that we are able to reduce the amount of disk operations and IOPS used in the system. An important fact, given that the disk we are using is a micro SD card.
                                    </p>
                                    <p>This situation mimics most cloud environments. where you may be  paying a <em>lot</em> to get better disks and IOPS, to match your needs. This feature can dramatically reduce your costs.</p>

                                    <h3 className="mt-5 mb-3">Why did we put RavenDB on a Raspberry?</h3>
                                    <p>
                                        In short, because we can! Because it is cool! And because it is fun!
                                    </p>
                                    <p>
                                        RavenDB running on Raspberry Pi isn't just a gimmick, it is an important use case for us. When it comes to deploying RavenDB as part of Internet of Things, we are often running on Raspberry Pi or similar hardware. This appliance is perfect for showing how you can run databases as part of edge deployments.
                                    </p>

                                    <p>
                                        RavenDB is managing gigabytes of information. While running on a constrained device with about 512MB of RAM and (a slow) SD card for storage. We stacked the cards against us being able to deliver a good user experience and a nice application. Despite all the hurdles we put in the way, Hugin (utilizing RavenDB) is able to provide a very responsive user experience.
                                    </p>
                                    <p>
                                        In your environment, you can give RavenDB more resources and see it deliver cutting edge performance and throughput at any load.
                                    </p>


                                    <h3>Querying</h3>
                                    <p>
                                        RavenDB uses indexes to speed up queries. These allow us to search  data in an efficent manner. as well as showing statistics on tags distributions. These indexes are defined as part of the backend code. you can click on their buttons below to see their definition. RavenDB indexes allows you to shift the work from the query time to indexing time. Allowing us to create a very fast experience for you, the user. Even when running on a very low end machine, or a cloud instance.
                                    </p>

                                    {codeToShow ? (<CodeModal code={codeToShow} onClose={() => setCodeToShow(null)} />) : (<></>)}
                                    <ul className="indexes-list hstack gap-3 flex-wrap my-4">
                                        {serverResult.indexes.map((i, index) => (
                                            <li key={index}>
                                                <button className="backend-timing-btn btn btn-lg  btn-secondary " onClick={() => { setCodeToShow(i.code); }}>
                                                    <img src={`/img/code.svg`} className="backend-timing-btn-img" /> <code>{i.name}</code>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <p>
                                        You can learn more about <ExternalLink href="https://ravendb.net/docs/article-page/6.0/csharp/indexes/what-are-indexes">RavenDB's indexes in our documentation</ExternalLink>.
                                    </p>

                                    <h3>How we got the data?</h3>
                                    <p>
                                        The data we are using for this project was taken from the <ExternalLink href="https://archive.org/details/stackexchange">Stack Exchange Data Dump</ExternalLink> on archive.org. We took the data sets from the sites focused on administration and devops, so we could generate a dataset to be used offline that would be <em>useful</em> for actual in-field work. </p>                                     <p>You can add your own communities to the dataset, visit the archive.org <ExternalLink href="https://archive.org/details/stackexchange">Stack Exchange Data Dump</ExternalLink> and download the data sets you want. Then, you can use the following <ExternalLink href="https://gist.github.com/ayende/50cd2f071547016a635adf21292fd0bc">code snippet</ExternalLink> to import the data into RavenDB. You'll also need to provide an <code>svg</code> icon file for the community, to get the UI to display it properly.
                                    </p>
                                    <h4>Can I get an offline Stack Overflow?</h4>
                                    <p>
                                        The Stack Overflow data dump is <em>huge</em>. Even with compression, it is over 50GB in size (and without compression) it is much bigger. You'll need to either connect an additional disk to the Raspberry Pi or use a bigger micro SD card to manage that. </p>
                                    <p>
                                        Note that the primary limitation here is the amount of disk space that you have. RavenDB can handle that much data without any issues, even on a machine as small as the Raspberry Pi Zero 2 W.
                                    </p>
                                    <p>
                                        The Stack Overflow data dump is distributed using multiple files, so you'll need to update the <ExternalLink href="https://gist.github.com/ayende/50cd2f071547016a635adf21292fd0bc">code snippet</ExternalLink> to handle that (instead of assuming all the files are in the same archive file). But aside from that, it works just fine. </p>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="col-lg-4 mb-4">
                        <div className="info-col right-col">

                            <div className="card bg-faded-primary text-light">
                                <div className="card-body ">
                                    <h3>💡Tip: Read the code</h3>
                                    <p>Most pages has this code icon that you can click:</p>
                                    <img src="/img/code.svg" alt="Code Marker" width={50} />
                                    <p>That will open the backend code for that particular page so you can inspect in details how we actually wrote the code for this application.</p>
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
                                        RavenDB is really fast, even on small devices like the Raspberry Pi Zero 2 W. We show you exactly how long it took to run the query on each and every page.
                                    </p>
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
                                            <ExternalLink href="https://ravendb.net/?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">
                                                RavenDB Home Page
                                            </ExternalLink>
                                        </li>
                                        <li>
                                            <ExternalLink href="https://ravendb.net/try?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">
                                                RavenDB Try
                                            </ExternalLink>
                                        </li>
                                        <li>
                                            <ExternalLink href="https://github.com/ravendb/ravendb/discussions?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">
                                                GitHub Discussions
                                            </ExternalLink>
                                        </li>
                                        <li>
                                            <ExternalLink href="https://github.com/ravendb/samples-hugin/?utm_source=appliance&utm_medium=embedded-app&utm_campaign=hugin">
                                                Hugin&apos;s GitHub page
                                            </ExternalLink>
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body">
                                    <em>Note:</em> you may need to disconnect from Hugin&apos;s WiFi and connect to the normal network to access those links. By default Hugin&apos;s WiFi is not connected to the Internet.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

        </main >
    )
}

export default How