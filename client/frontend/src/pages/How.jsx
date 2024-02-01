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
                                    <p className="lead">Hugin is an appliance meant to provide you with the ability to browse through the Stack Exchange data in an offline manner. In this page we'll take a deep dive into its building blocks</p>
                                    <p>Hugin is built using the following tech:</p>
                                    <ul>
                                        <li><strong>Hardware:</strong> Raspberry Pi Zero 2 W (but any Raspberry Pi with a WiFi connection will do</li>
                                        <li><strong>Operating System:</strong> Raspberry Pi OS Lite (32 Bits, Bullseye)</li>
                                        <li><strong>Database:</strong> RavenDB 6.0</li>
                                        <li><strong>Programming Language:</strong> JavaScript (node.js, Express, React)</li>
                                        <li><strong>Disk: </strong> 32 GB micro SD card</li>
                                    </ul>
                                    <h3>Default data sets</h3>
                                    <p>
                                        Hugin comes with pre-loaded with a few Stack Exchange communities. you can start using it immeidately. We chose to include the following communities: <code>raspberrypi.stackexchange.com</code>, <code>unix.stackexchange.com</code>, <code>serverfault.com</code>, and <code>superuser.com</code>.
                                    </p>
                                    <p>In total, the dataset contains <em>4.3 million documents</em> and over <em>2.6 million Q&As</em>. while it consumes just over 5GB of disk space. This is possible due to RavenDB useing documents compression. without it, the data size is about 11GB. Hence, RavenDB's documents compression feature is able to reduce the disk space used by over 50%. it also means that we are able to reduce the amount of disk operations and IOPS used in the system. An important fact, given that the disk we are using is a micro SD card.</p>
                                    <p>This situation mimics most cloud environments. where you may be  paying a <em>lot</em> to get better disks and IOPS, to match your needs. This feature can dramatically reduce your cost.</p>

                                    <h3 className="mt-5 mb-3">Why did we put RavenDB on a Raspberry?</h3>
                                    <p>
                                        In short, because we can, it's cool, and  it's fun!
                                    </p>
                                    <p>
                                        RavenDB can run on a Raspberry Pi, it is actually an important use case. When it comes to deploying RavenDB as part of Internet of Things. This appliance is perfect for showing edgy database deployment. We have a lot of users who are doing just that.
                                    </p>
                                    <p>
                                        Also, we wanted to exhibit how RavenDB can run on a very small device. specifically to show how efficient it is running with very few resources. You can see how fast this application is. While RavenDB is running on a device likely less powerful than your watch. In the same vien, RavenDB can deliver low latency, high availability and high throughput for your systems. Most importantly, it can do that while encapsulating a lot of the complexity building such system.
                                    </p>

                                    <p>
                                        Hugin is open source ,as is RavenDB for that matter. If
                                        you&apos;ll browse Hugin&apos;s source code, which we highly
                                        encourage, you&apos;ll see that there isn&apos;t anything fancy going
                                        on there. It is a pretty standard React application, using node.js
                                        server in the backend talking to RavenDB. The key here is that we
                                        work with the most vanilla setup possible, yet
                                        getting a big value from RavenDB.
                                    </p>
                                    <p>
                                        RavenDB is managing gigabytes of information. While running on a
                                        constrained device with about 512MB of RAM and SD Card as
                                        storage. It's a very slow device. yet, we push it to a very large extent. We
                                        stacked the cards against us being able to deliver a good user
                                        experience and a naet application. It's doing so while
                                        providing a very responsive user experience.
                                    </p>
                                    <p>Conversely, you can give RavenDB more resources and see it deliver
                                        cutting edge performance and throughput at any load.
                                    </p>

                                    <h3>Querying</h3>
                                    <p>
                                        RavenDB uses indexes to speed up queries. These allow us to search  data in an efficent manner. as well as showing statistics on tags distributions. The following indexes are defined:
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
                                    <p>These indexes are defined as part of the backend code. you can click on their buttons above to see the definition. RavenDB indexes allows you to shift the work from the query time to indexing time. allowing us to create a very fast experience for you, the user. Even when running on a very low end machine ,or a cloud instance.
                                    </p>

                                    <h3>How we got the data?</h3>
                                    <p>
                                        The data we are using for this project was taken from the <a href="https://archive.org/details/stackexchange">Stack Exchange Data Dump</a>, on archive.org. We took the data sets from the sites focused on administration and devops. So we could generate a dataset to be used offline that is <em>useful</em> for actual in-field work. </p>
                                    <p>You can add your own communities to the dataset. visit the archive.org <a href="https://archive.org/details/stackexchange">Stack Exchange Data Dump</a> and download the data sets you want. Then, you can use the following <a href="https://gist.github.com/ayende/50cd2f071547016a635adf21292fd0bc">code snippet</a> to import the data into RavenDB. You'll also need to provide an <code>svg</code> icon file for the community. To get the UI to display it properly.
                                    </p>
                                    <h4>Can I get an offline Stack Overflow?</h4>
                                    <p>
                                        The Stack Overflow data dump is <em>huge</em>. Even with compression, it is over 50GB in size. Without any compression it is much bigger. You'll need to either connect an additional disk to the Raspberry Pi. Or use a bigger micro SD card to manage that data. </p>
                                    <p>
                                        Note that the primary limitation here is the amount of disk space available. RavenDB can handle that much data without any issues, even on a machine as small as the Raspberry Pi Zero 2 W.
                                    </p>
                                    <p>
                                        The Stack Overflow data dump is distributed using multiple files. You'll need to update the <a href="https://gist.github.com/ayende/50cd2f071547016a635adf21292fd0bc">code snippet</a> to handle its upload. Instead of assuming all the files are in the same archive file. But asides that, it works just fine. </p>
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