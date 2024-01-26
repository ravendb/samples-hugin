import "../styles/HomePage.css";

function HomePage() {
    const cards = [
        {
            name: "Raspberry Pi",
            description: "Raspberry Pi Stack Exchange is a question and answer site for users and developers of hardware and software for Raspberry Pi",
            image: "raspberry-pi.svg",
            link: "technology/raspberry-pi"
        }, {
            name: "Server Fault",
            description: "Server Faults is a question and answer site for system and network administrators",
            image: "server.svg",
            link: "technology/server-fault"
        }, {
            name: "Unix & Linux",
            description: "Unix & Linux Stack Exchange Is a question and answer site for users of Linux, FreeBSD and other Un*x-like operating systems",
            image: "linux.svg",
            link: "technology/unix"
        }, {
            name: "RavenDB",
            description: "Learn more about RavenDB and how to best use it",
            image: "ravendb-logo.svg",
            link: "technology/ravendb"
        },
    ]

    return (
        <main className="home-page">
            <h1>Home Page</h1>
        </main>
    );
}

export default HomePage;