function How() {
    return (
        <div>
            <div className="hero">
                <img src="/img/hero.jpg" className="hero-img" alt="" />
                <div className="hero-container">
                    <div className="hero-content">
                        <h1>
                            <img src="/img/ravendb-logo.svg" className="ravendb-logo" alt="RavenDB" />
                        </h1>
                        <div className="hero-input input-group input-group-lg">
                            <input type="text" className="form-control px-4 py-2" placeholder="Search database" />
                            <button className="btn btn-primary px-4" type="button" id="">Search</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container mt-5">

                <div class="row mt-4">
                    <div class="col-md-8 mb-3">
                        <div class="card p-5">
                            <div class="hstack gap-4 align-items-center mb-4">
                                <img src="/img/raven.svg" width="50px" alt="" />
                                <h2 class="m-0">All about Hugin</h2>
                            </div>
                            <p class="lead">Hugin is an appliance, meant to provide you with the ability
                                to browse through the Stack Exchange data in an offline manner. In this page
                                we'll take a deep dive into exactly it is built</p>
                            <p>It is built using the following technologies:</p>
                            <ul>
                                <li><strong>Hardware:</strong> Raspberry Pi Zero 2 W (but any Raspberry Pi
                                    with a WiFi connection will do</li>
                                <li><strong>Operating System:</strong> Raspberry Pi OS Lite (32 Bits, Bullseye)</li>
                                <li><strong>Database:</strong> RavenDB 6.0</li>
                                <li><strong>Programming Language:</strong> JavaScript</li>
                            </ul>

                        </div>
                    </div>

                    <div class="col-md-4 mb-3">
                        <div class="card p-3 mb-3">
                            <h3>💡Tip: Read the code</h3>
                            <p>Most pages has this code icon that you can click:</p>
                            <img src="/img/code.svg" alt="Code Marker" width={50} />
                            <p>That will open the backend code for that particular page so you can inspect in details
                                how we actually wrote the code for this application.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div >
    )
}

export default How