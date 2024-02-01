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
                                    <p className="lead">Hugin is an appliance, meant to provide you with the ability to browse through the Stack Exchange data in an offline manner. In this page we'll take a deep dive into exactly it is built</p>
                                    <p>It is built using the following technologies:</p>
                                    <ul>
                                        <li><strong>Hardware:</strong> Raspberry Pi Zero 2 W (but any Raspberry Pi with a WiFi connection will do</li>
                                        <li><strong>Operating System:</strong> Raspberry Pi OS Lite (32 Bits, Bullseye)</li>
                                        <li><strong>Database:</strong> RavenDB 6.0</li>
                                        <li><strong>Programming Language:</strong> JavaScript (node.js, Express, React)</li>
                                        <li><strong>Disk: </strong> 32 GB micro SD card</li>
                                    </ul>
                                    <h3>Default data sets</h3>
                                    <p>
                                        Hugin comes with pre-loaded with a few Stack Exchange communities, so you can start using it immeidately. We chose to include the following communities: <code>raspberrypi.stackexchange.com</code>, <code>unix.stackexchange.com</code>, <code>serverfault.com</code>, and <code>superuser.com</code>.
                                    </p>
                                    <p>In total, the dataset contains <em>4.3 million documents</em> and over <em>2.6 million questions and answers</em> and consumes just over 5GB of disk space. This is possible because RavenDB used documents compression, without which the data size is about 11GB. RavenDB's documents compression feature was able to reduce the disk space used by over 50%. That also means that we are able to reduce the amount of disk operations and IOPS used in the system, which is very important given that the disk we are using is a micro SD card.</p>
                                    <p>The situation is the same in most cloud environments, where you may be  paying a <em>lot</em> to get better disks and IOPS to match your needs. This feature can dramatically reduce this cost.</p>

                                    <h3 className="mt-5 mb-3">Why did we put RavenDB on a Raspberry?</h3>
                                    <p>
                                        In short, because we can! Because it is cool! And because it is fun!
                                    </p>
                                    <p>
                                        RavenDB can run on the Raspberry Pi, it is actually an important use case for us when it comes to deploying RavenDB as part of Internet of Things systems. The platfrom is perfect for when you need to deploy a database on the edge, and we have a lot of users who are doing just that.
                                    </p>
                                    <p>
                                        We also wanted to show case how RavenDB can run on a very small device, specifically to show how efficient it is in running with very few resources. You can see how fast this application is, while RavenDB is running on a device that is likely less powerful than your watch. In the same vien, RavenDB can deliver low latency, high availability and high throughput for your systems. Most importantly, it can do that while encapsulating a lot of the complexity of building such as system.
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

                                    <h3>Querying</h3>
                                    <p>
                                        RavenDB uses indexes to speed up queries. These allow us to search for questions in an efficent manner as well as show statistics on tags distributions. The following indexes are defined:
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
                                    <p>Those indexes are defined as part of the backend code and you can click on their buttons above to see the definition. RavenDB indexes allows you to shift the work from the query time to indexing time and allows us to create a very fast experience for the user. Even when running on a very low end machine (or a cloud instance).
                                    </p>

                                    <h3>How we got the data?</h3>
                                    <p>
                                        The data we are using for this project was taken from the <a href="https://archive.org/details/stackexchange">Stack Exchange Data Dump</a> on archive.org. We took the data sets from the sites focused on administration and devops, so we could generate a dataset to be used offline that would be <em>useful</em> for actual in-field work. </p>
                                    <p>You can add your own communities to the dataset, visit the archive.org <a href="https://archive.org/details/stackexchange">Stack Exchange Data Dump</a> and download the data sets you want. Then, you can use the following <a href="https://gist.github.com/ayende/50cd2f071547016a635adf21292fd0bc">code snippet</a> to import the data into RavenDB. You'll also need to provide an <code>svg</code> icon file for the community, to get the UI to display it properly.
                                    </p>
                                    <h4>Can I get an offline Stack Overflow?</h4>
                                    <p>
                                        The Stack Overflow data dump is <em>huge</em>. Even with compression, it is over 50GB in size (and without compression) it is much bigger. You'll need to either connect an additional disk to the Raspberry Pi or use a bigger micro SD card to manage that. </p>
                                    <p>
                                        Note that the primary limitation here is the amount of disk space that you have. RavenDB can handle that much data without any issues, even on a machine as small as the Raspberry Pi Zero 2 W.
                                    </p>
                                    <p>
                                        The Stack Overflow data dump is distributed using multiple files, so you'll need to update the <a href="https://gist.github.com/ayende/50cd2f071547016a635adf21292fd0bc">code snippet</a> to handle that (instead of assuming all the files are in the same archive file). But aside from that, it works just fine. </p>
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
            </div >

        </main >
    )
}

export default How